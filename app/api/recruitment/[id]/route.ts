import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/authorize-admin";
import { revalidateTag } from "next/cache";

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const PHONE_RE = /^\+?[0-9\s-]{7,15}$/;

const EDITABLE_TEXT_FIELDS = [
  "name",
  "rollNo",
  "instituteEmail",
  "personalEmail",
  "gender",
  "branch",
  "phoneNo",
  "locality",
  "techStack",
] as const;

type EditableTextField = (typeof EDITABLE_TEXT_FIELDS)[number];

export async function PUT(
  request: NextRequest,
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
          message: "Recruitment id is required",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const data: Partial<Record<EditableTextField, string>> & {
      isSelected?: boolean;
    } = {};
    for (const field of EDITABLE_TEXT_FIELDS) {
      if (body[field] === undefined) continue;

      const value = String(body[field]).trim();

      if (!value) {
        return Response.json(
          {
            success: false,
            message: `${field} cannot be empty`,
          },
          { status: 400 }
        );
      }

      data[field] = value;
    }

    if (data.instituteEmail && !EMAIL_RE.test(data.instituteEmail)) {
      return Response.json(
        {
          success: false,
          message: "Institute email must be a valid email",
        },
        { status: 400 }
      );
    }

    if (data.personalEmail && !EMAIL_RE.test(data.personalEmail)) {
      return Response.json(
        {
          success: false,
          message: "Personal email must be a valid email",
        },
        { status: 400 }
      );
    }

    if (data.phoneNo && !PHONE_RE.test(data.phoneNo)) {
      return Response.json(
        {
          success: false,
          message: "Phone number must be valid",
        },
        { status: 400 }
      );
    }

    if (body.isSelected !== undefined) {
      data.isSelected = Boolean(body.isSelected);
    }

    if (Object.keys(data).length === 0) {
      return Response.json(
        {
          success: false,
          message: "No fields to update",
        },
        { status: 400 }
      );
    }

    const recruitment = await prisma.recruitment.update({
      where: { id },
      data,
    });

    revalidateTag("recruitment", "max");

    return Response.json(
      {
        success: true,
        message: "Application updated successfully",
        recruitment,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update recruitment application:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to update application",
      },
      { status: 500 }
    );
  }
}

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
          message: "Recruitment id is required",
        },
        { status: 400 }
      );
    }

    await prisma.recruitment.delete({
      where: { id },
    });

    revalidateTag("recruitment", "max");

    return Response.json(
      {
        success: true,
        message: "Application deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete recruitment application:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to delete application",
      },
      { status: 500 }
    );
  }
}
