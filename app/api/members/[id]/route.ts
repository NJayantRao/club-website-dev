import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import uploadImageToCloudinary from "@/lib/upload-image-cloudinary";
import { requireAdminAuth } from "@/lib/authorize-admin";
import { MediaUsageType, Role } from "@prisma/client";
import { revalidateTag } from "next/cache";
import { getMediaUrl, removeMedia, replaceMedia } from "@/lib/media";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth();

    if (!auth.success) {
      return auth.response;
    }

    const { id } = await params;

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

    const member = await prisma.$transaction(async (tx) => {
      const deleted = await tx.member.delete({
        where: {
          id,
        },
      });

      await removeMedia(MediaUsageType.PROFILE, id, tx);

      return deleted;
    });

    revalidateTag("members", "max");

    return Response.json(
      {
        success: true,
        message: `${member.name} deleted successfully.`,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Failed to delete member:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to delete member.",
      },
      {
        status: 500,
      }
    );
  }
}
function optionalTextField(
  formData: FormData,
  key: string
): string | null | undefined {
  const raw = formData.get(key);

  if (raw === null) return undefined;

  const trimmed = (raw as string).trim();
  return trimmed === "" ? null : trimmed;
}

function requiredTextField(
  formData: FormData,
  key: string
): string | undefined {
  const raw = formData.get(key);

  if (raw === null) return undefined;

  return (raw as string).trim();
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth();

    if (!auth.success) {
      return auth.response;
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

    const name = requiredTextField(formData, "name");
    const email = requiredTextField(formData, "email");
    const phone = optionalTextField(formData, "phone");
    const role = (formData.get("role") as Role) ?? undefined;
    const year = optionalTextField(formData, "year");
    const designation = optionalTextField(formData, "designation");

    if (name === "") {
      return Response.json(
        { success: false, message: "Name cannot be empty." },
        { status: 400 }
      );
    }

    if (email === "") {
      return Response.json(
        { success: false, message: "Email cannot be empty." },
        { status: 400 }
      );
    }

    const skillsValue = formData.get("skills");
    const skills = skillsValue
      ? (JSON.parse(skillsValue as string) as string[])
      : undefined;

    const image = formData.get("image") as File | null;

    let newImageUrl: string | undefined;
    let newImagePublicId: string | null = null;

    if (image && image.size > 0) {
      const uploaded = await uploadImageToCloudinary(image, "club-members");
      newImageUrl = uploaded.url;
      newImagePublicId = uploaded.publicId;
    }

    const member = await prisma.$transaction(async (tx) => {
      const updated = await tx.member.update({
        where: {
          id,
        },
        data: {
          name,
          email,
          phone,
          role,
          year,
          designation,
          skills,
        },
      });

      if (newImageUrl) {
        await replaceMedia(
          MediaUsageType.PROFILE,
          id,
          newImageUrl,
          newImagePublicId,
          tx
        );
      }

      return updated;
    });

    const imageUrl =
      newImageUrl ?? (await getMediaUrl(MediaUsageType.PROFILE, id));

    revalidateTag("members", "max");

    return Response.json(
      {
        success: true,
        message: `${member.name} updated successfully.`,
        member: { ...member, imageUrl },
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
