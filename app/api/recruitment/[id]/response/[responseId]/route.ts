import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/authorize-admin";
import { revalidateTag } from "next/cache";
import { Gender, Locality } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
      responseId: string;
    }>;
  }
) {
  try {
    const auth = await requireAdminAuth();

    if (!auth.success) {
      return auth.response;
    }

    const { id, responseId } = await params;

    const body = await request.json();

    const existing = await prisma.recruitmentResponse.findFirst({
      where: {
        id: responseId,
        recruitmentId: id,
      },
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

    const updated = await prisma.recruitmentResponse.update({
      where: {
        id: responseId,
      },
      data: {
        ...(body.name !== undefined && {
          name: body.name.trim(),
        }),

        ...(body.rollNumber !== undefined && {
          rollNumber: body.rollNumber.trim(),
        }),

        ...(body.registrationNo !== undefined && {
          registrationNo: body.registrationNo.trim(),
        }),

        ...(body.gender !== undefined && {
          gender: body.gender as Gender,
        }),

        ...(body.nistEmail !== undefined && {
          nistEmail: body.nistEmail.trim(),
        }),

        ...(body.personalEmail !== undefined && {
          personalEmail: body.personalEmail.trim(),
        }),

        ...(body.branch !== undefined && {
          branch: body.branch.trim(),
        }),

        ...(body.hackerrankId !== undefined && {
          hackerrankId: body.hackerrankId.trim(),
        }),

        ...(body.phoneNumber !== undefined && {
          phoneNumber: body.phoneNumber.trim(),
        }),

        ...(body.locality !== undefined && {
          locality: body.locality as Locality,
        }),

        ...(body.techStack !== undefined && {
          techStack: body.techStack.trim(),
        }),

        ...(body.answers !== undefined && {
          answers: body.answers,
        }),

        ...(body.isSelected !== undefined && {
          isSelected: body.isSelected,
        }),
      },
    });

    revalidateTag("recruitments", "max");

    return Response.json(
      {
        success: true,
        message: "Response updated successfully",
        response: updated,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Failed to update response",
      },
      {
        status: 500,
      }
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
      responseId: string;
    }>;
  }
) {
  const auth = await requireAdminAuth();

  if (!auth.success) return auth.response;

  const { id, responseId } = await params;

  const existing = await prisma.recruitmentResponse.findFirst({
    where: {
      id: responseId,
      recruitmentId: id,
    },
  });

  if (!existing) {
    return Response.json(
      { success: false, message: "Response not found" },
      { status: 404 }
    );
  }

  await prisma.recruitmentResponse.delete({
    where: {
      id: responseId,
    },
  });

  revalidateTag("recruitments", "max");

  return Response.json({
    success: true,
    message: "Response deleted successfully",
  });
}
