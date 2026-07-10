import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!session || !user) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized request",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return Response.json(
        {
          success: false,
          message: "Event id is required",
        },
        { status: 400 }
      );
    }

    const data = await request.json();

    const event = await prisma.event.update({
      where: {
        id,
      },
      data: {
        ...data,
      },
    });

    return Response.json(
      {
        success: true,
        message: "Event updated successfully",
        event,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Failed in updating event", error);

    return Response.json(
      {
        success: false,
        message: "Failed to update event",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!session || !user) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized request",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return Response.json(
        {
          success: false,
          message: "Event id is required",
        },
        { status: 400 }
      );
    }

    await prisma.event.delete({
      where: {
        id,
      },
    });

    return Response.json(
      {
        success: true,
        message: "Event deleted successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Failed in deleting event", error);

    return Response.json(
      {
        success: false,
        message: "Failed to delete event",
      },
      {
        status: 500,
      }
    );
  }
}
