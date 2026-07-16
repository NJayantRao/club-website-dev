import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/authorize-admin";

export async function PATCH(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string; responseId: string }>;
  }
) {
  try {
    const auth = await requireAdminAuth();

    if (!auth.success) {
      return auth.response;
    }

    const { id, responseId } = await params;

    const existing = await prisma.eventResponse.findFirst({
      where: { id: responseId, eventId: id },
    });

    if (!existing) {
      return Response.json(
        {
          success: false,
          message: "Response not found",
        },
        { status: 404 }
      );
    }

    const { attendance } = await request.json();

    const response = await prisma.eventResponse.update({
      where: { id: responseId },
      data: {
        attendance: Boolean(attendance),
      },
    });

    return Response.json(
      {
        success: true,
        message: "Response updated successfully",
        response,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update response:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to update response",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string; responseId: string }>;
  }
) {
  try {
    const auth = await requireAdminAuth();

    if (!auth.success) {
      return auth.response;
    }

    const { id, responseId } = await params;

    const existing = await prisma.eventResponse.findFirst({
      where: { id: responseId, eventId: id },
    });

    if (!existing) {
      return Response.json(
        {
          success: false,
          message: "Response not found",
        },
        { status: 404 }
      );
    }

    await prisma.eventResponse.delete({
      where: { id: responseId },
    });

    return Response.json(
      {
        success: true,
        message: "Response deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete response:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to delete response",
      },
      { status: 500 }
    );
  }
}
