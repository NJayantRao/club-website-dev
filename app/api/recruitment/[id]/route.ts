import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/authorize-admin";
import { revalidateTag } from "next/cache";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return Response.json(
        { success: false, message: "Drive id is required" },
        { status: 400 }
      );
    }

    const drive = await prisma.recruitmentDrive.findUnique({
      where: { id },
      include: {
        formFields: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: { responses: true },
        },
      },
    });

    if (!drive) {
      return Response.json(
        { success: false, message: "Recruitment drive not found" },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Recruitment drive fetched successfully",
        drive,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch recruitment drive:", error);

    return Response.json(
      { success: false, message: "Failed to fetch recruitment drive" },
      { status: 500 }
    );
  }
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

    if (!id) {
      return Response.json(
        { success: false, message: "Drive id is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      title,
      description,
      year,
      status,
      registrationStart,
      registrationEnd,
    } = body;

    // Only one drive should be accepting applications at a time — opening
    // a second one is almost always a mistake (it's how the "field added
    // to one drive, applicant lands on another" bug happens). Block it
    // with a clear error instead of silently allowing it.
    if (status === "OPEN") {
      const conflicting = await prisma.recruitmentDrive.findFirst({
        where: { status: "OPEN", id: { not: id } },
        select: { id: true, title: true },
      });

      if (conflicting) {
        return Response.json(
          {
            success: false,
            message: `"${conflicting.title}" is already open for registration. Close it before opening this drive.`,
            conflictingDriveId: conflicting.id,
          },
          { status: 409 }
        );
      }
    }

    const drive = await prisma.recruitmentDrive.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(year !== undefined && { year: Number(year) }),
        ...(status !== undefined && { status }),
        ...(registrationStart !== undefined && {
          registrationStart: registrationStart
            ? new Date(registrationStart)
            : null,
        }),
        ...(registrationEnd !== undefined && {
          registrationEnd: registrationEnd ? new Date(registrationEnd) : null,
        }),
      },
    });

    revalidateTag("recruitment-drives", "max");

    return Response.json(
      {
        success: true,
        message: "Recruitment drive updated successfully",
        drive,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update recruitment drive:", error);

    return Response.json(
      { success: false, message: "Failed to update recruitment drive" },
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
        { success: false, message: "Drive id is required" },
        { status: 400 }
      );
    }

    await prisma.recruitmentDrive.delete({ where: { id } });

    revalidateTag("recruitment-drives", "max");

    return Response.json(
      {
        success: true,
        message: "Recruitment drive deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete recruitment drive:", error);

    return Response.json(
      { success: false, message: "Failed to delete recruitment drive" },
      { status: 500 }
    );
  }
}
