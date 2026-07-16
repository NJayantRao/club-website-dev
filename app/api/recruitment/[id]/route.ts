import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/authorize-admin";

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

    const { isSelected } = await request.json();

    const recruitment = await prisma.recruitment.update({
      where: { id },
      data: {
        isSelected: Boolean(isSelected),
      },
    });

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
