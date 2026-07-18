import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/authorize-admin";
import { MediaUsageType } from "@prisma/client";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; mediaId: string }> }
) {
  try {
    const auth = await requireAdminAuth();

    if (!auth.success) {
      return auth.response;
    }

    const { id, mediaId } = await params;

    if (!id || !mediaId) {
      return Response.json(
        {
          success: false,
          message: "Album id and media id are required",
        },
        { status: 400 }
      );
    }

    // Confirm this media actually belongs to this album before deleting,
    // so one album's edit view can't be used to delete another's photo.
    const usage = await prisma.mediaUsage.findFirst({
      where: {
        mediaId,
        entityId: id,
        type: MediaUsageType.GALLERY,
      },
    });

    if (!usage) {
      return Response.json(
        {
          success: false,
          message: "Photo not found in this album",
        },
        { status: 404 }
      );
    }

    // Deleting the Media row cascades to delete its MediaUsage row too.
    await prisma.media.delete({
      where: { id: mediaId },
    });

    return Response.json(
      {
        success: true,
        message: "Photo removed successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete gallery photo:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to delete gallery photo",
      },
      { status: 500 }
    );
  }
}
