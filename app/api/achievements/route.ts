import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { AchievementType } from "@prisma/client";
import uploadImageToCloudinary from "@/lib/upload-image-cloudinary";
import { requireAdminAuth } from "@/lib/authorize-admin";

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get("page")!) || 1;
    const limit = parseInt(searchParams.get("limit")!) || 5;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const skip = (page - 1) * limit;

    const achievements = await prisma.achievement.findMany({
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    return Response.json(
      {
        success: true,
        message: " Achievement fetched successfully",
        achievements,
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
