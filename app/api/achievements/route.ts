import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { AchievementType } from "@prisma/client";
import uploadImageToCloudinary from "@/lib/upload-image-cloudinary";
import { requireAdminAuth } from "@/lib/authorize-admin";
import { revalidateTag, unstable_cache } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth();

    if (!auth.success) {
      return auth.response;
    }

    const formData = await request.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const tag = formData.get("tag") as AchievementType;
    const achievedAt = formData.get("achievedAt") as string;
    const image = formData.get("image") as File | null;
    const memberIds = JSON.parse((formData.get("memberIds") as string) || "[]");

    if (!title) {
      return Response.json(
        {
          success: false,
          message: "Title is required",
        },
        {
          status: 400,
        }
      );
    } else if (!tag) {
      return Response.json(
        {
          success: false,
          message: "Achievement tag is required",
        },
        {
          status: 400,
        }
      );
    } else if (!achievedAt) {
      return Response.json(
        {
          success: false,
          message: "Achievement date is required",
        },
        {
          status: 400,
        }
      );
    }

    //  TODO: refer after members api
    // if (memberIds.length === 0) {
    //   return Response.json(
    //     {
    //       success: false,
    //       message: "At least one member is required.",
    //     },
    //     { status: 400 }
    //   );
    // }

    let imageUrl: string | null = null;

    if (image && image.size > 0) {
      imageUrl = await uploadImageToCloudinary(image, "club-achievements");
    }

    const achievement = await prisma.achievement.create({
      data: {
        title,
        description: description,
        imageUrl,
        tag,
        achievedAt: new Date(achievedAt),
        // members: {
        //   connect: memberIds.map((id: string) => ({
        //     id,
        //   })),
        // },
      },
    });

    revalidateTag("achievements", "max");

    return Response.json(
      {
        success: true,
        message: `${achievement.title} registered successfully`,
        achievement,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Failed to register achievement:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to register achievement",
      },
      {
        status: 500,
      }
    );
  }
}

const getCachedAchievements = unstable_cache(
  async (skip: number, limit: number, sortBy: string, sortOrder: string) => {
    const [achievements, total] = await Promise.all([
      prisma.achievement.findMany({
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          title: true,
          description: true,
          achievedAt: true,
          imageUrl: true,
          tag: true,
        },
      }),
      prisma.achievement.count(),
    ]);

    // unstable_cache serializes its return value to JSON. A cache miss
    // hands back a real Date from Prisma, but a later cache hit hands back
    // the deserialized (plain string) version — so do the Date -> string
    // conversion here, inside the cached function, to keep the shape
    // identical on every call instead of only correct on the first one.
    const data = achievements.map((achievement) => ({
      id: achievement.id,
      title: achievement.title,
      description: achievement.description ?? "",
      achievedAt: achievement.achievedAt.toISOString(),
      tag: achievement.tag,
      imageUrl: achievement.imageUrl,
    }));

    return { data, total };
  },
  ["achievements-admin-list"],
  { tags: ["achievements"], revalidate: 86400 }
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get("page")!) || 1;
    const limit = parseInt(searchParams.get("limit")!) || 5;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const skip = (page - 1) * limit;

    const { data, total } = await getCachedAchievements(
      skip,
      limit,
      sortBy,
      sortOrder
    );

    return Response.json(
      {
        success: true,
        message: "Achievement fetched successfully",
        // Field names match the Prisma schema (and the POST/PATCH routes),
        // so the frontend can use the same `Achievement` type everywhere
        // instead of a one-off remapped shape.
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Failed to fetch achievements:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch achievements",
      },
      {
        status: 500,
      }
    );
  }
}
