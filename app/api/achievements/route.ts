import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import { AchievementType } from "@prisma/client";
import uploadImageToCloudinary from "@/lib/upload-image-cloudinary";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!session || !user) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized request",
        },
        {
          status: 401,
        }
      );
    }

    const formData = await request.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const tag = formData.get("tag") as AchievementType;
    const achievedAt = formData.get("achievedAt") as string;
    const image = formData.get("image") as File | null;

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

    let imageUrl: string | null = null;

    if (image && image.size > 0) {
      imageUrl = await uploadImageToCloudinary(image);
    }

    const achievement = await prisma.achievement.create({
      data: {
        title,
        description: description,
        imageUrl,
        tag,
        achievedAt: new Date(achievedAt),
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
