import { NextRequest } from "next/server";
import uploadImageToCloudinary from "@/lib/upload-image-cloudinary";
import prisma from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/authorize-admin";
import { Role } from "@prisma/client";
import { revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth();

    if (!auth.success) {
      return auth.response;
    }

    const formData = await request.formData();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = (formData.get("phone") as string | null) ?? null;
    const role = (formData.get("role") as Role) || undefined;
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

    revalidateTag("members", "max");

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
