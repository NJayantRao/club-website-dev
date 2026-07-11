import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(
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

    const {
      name,
      label,
      type,
      required = false,
      placeholder,
      order,
    } = await request.json();

    const event = await prisma.eventFormField.create({
      data: {
        eventId: id,
        name,
        label,
        type,
        required,
        placeholder,
        order,
      },
    });

    return Response.json(
      {
        success: true,
        message: "Form field created successfully",
        event,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Failed in creating form field", error);

    return Response.json(
      {
        success: false,
        message: "Failed to create form field",
      },
      {
        status: 500,
      }
    );
  }
}
