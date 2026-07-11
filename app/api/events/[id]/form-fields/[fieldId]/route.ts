import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function PATCH(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
      fieldId: string;
    }>;
  }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized request",
        },
        { status: 401 }
      );
    }

    const { id, fieldId } = await params;

    const data = await request.json();

    const existingField = await prisma.eventFormField.findFirst({
      where: {
        id: fieldId,
        eventId: id,
      },
    });

    if (!existingField) {
      return Response.json(
        {
          success: false,
          message: "Form field not found",
        },
        { status: 404 }
      );
    }

    const formField = await prisma.eventFormField.update({
      where: {
        id: fieldId,
      },
      data: {
        ...data,
      },
    });

    return Response.json(
      {
        success: true,
        message: "Form field updated successfully",
        formField,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update form field:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to update form field",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
      fieldId: string;
    }>;
  }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized request",
        },
        { status: 401 }
      );
    }

    const { id, fieldId } = await params;

    const existingField = await prisma.eventFormField.findFirst({
      where: {
        id: fieldId,
        eventId: id,
      },
    });

    if (!existingField) {
      return Response.json(
        {
          success: false,
          message: "Form field not found",
        },
        { status: 404 }
      );
    }

    await prisma.eventFormField.delete({
      where: {
        id: fieldId,
      },
    });

    return Response.json(
      {
        success: true,
        message: "Form field deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete form field:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to delete form field",
      },
      { status: 500 }
    );
  }
}
