import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import uploadImageToCloudinary from "@/lib/upload-image-cloudinary";
import prisma from "@/lib/prisma";

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

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = (formData.get("phone") as string | null) ?? null;
    const role = (formData.get("role") as string) || undefined;
    const image = formData.get("image") as File | null;
    const skills = JSON.parse(
      (formData.get("skills") as string) || "[]"
    ) as string[];

    if (!name || !email) {
      return Response.json(
        {
          success: false,
          message: "Name and Email are required",
        },
        {
          status: 400,
        }
      );
    }

    if (skills.length === 0) {
      return Response.json(
        {
          success: false,
          message: "At least one skill is required.",
        },
        { status: 400 }
      );
    }

    let imageUrl: string | null = null;

    if (image && image.size > 0) {
      imageUrl = await uploadImageToCloudinary(image, "club-members");
    }

    const member = await prisma.member.create({
      data: {
        name,
        email,
        phone,
        imageUrl,
        role,
        skills,
      },
    });

    return Response.json(
      {
        success: true,
        message: `${member.name} registered successfully`,
        member,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Failed to register member:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to register member",
      },
      {
        status: 500,
      }
    );
  }
}
