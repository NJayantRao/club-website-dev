import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import uploadImageToCloudinary from "@/lib/upload-image-cloudinary";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
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
    const formData = await request.formData();

    if (!id) {
      return Response.json(
        {
          success: false,
          message: "Member ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const name = (formData.get("name") as string) ?? undefined;
    const email = (formData.get("email") as string) ?? undefined;
    const phone = (formData.get("phone") as string) ?? undefined;
    const role = (formData.get("role") as string) ?? undefined;
    const year = (formData.get("year") as string) ?? undefined;
    const status = (formData.get("status") as string) ?? undefined;

    const skillsValue = formData.get("skills");
    const skills = skillsValue
      ? (JSON.parse(skillsValue as string) as string[])
      : undefined;

    const image = formData.get("image") as File | null;

    let imageUrl: string | undefined;

    if (image && image.size > 0) {
      imageUrl = await uploadImageToCloudinary(image, "club-members");
    }

    const member = await prisma.member.update({
      where: {
        id,
      },
      data: {
        name,
        email,
        phone,
        role,
        year,
        status,
        skills,
        imageUrl,
      },
    });

    return Response.json(
      {
        success: true,
        message: `${member.name} updated successfully.`,
        member,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Failed to update member:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to update member.",
      },
      {
        status: 500,
      }
    );
  }
}
