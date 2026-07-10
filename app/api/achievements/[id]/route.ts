import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    if (!id) {
      return Response.json(
        {
          success: false,
          message: "Achievement id is required",
        },
        {
          status: 400,
        }
      );
    }

    const data = await request.json();

    const achievement = await prisma.achievement.findUnique({
      where: {
        id,
      },
    });

    if (!achievement) {
      return Response.json(
        {
          success: false,
          message: "Achievement not found",
        },
        {
          status: 404,
        }
      );
    }

    const updatedAchievement = await prisma.achievement.update({
      where: {
        id,
      },
      data: {
        ...data,
      },
    });

    return Response.json(
      {
        success: true,
        message: "Achievement updated successfully",
        achievement: updatedAchievement,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Failed in updating achievement", error);

    return Response.json(
      {
        success: false,
        message: "Failed to update achievement",
      },
      {
        status: 500,
      }
    );
  }
}
