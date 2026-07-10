import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";

export async function GET(
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
        {
          status: 401,
        }
      );
    }

    const { id } = await params;

    if (!id) {
      return Response.json(
        {
          success: false,
          message: "Contact inquiry id is required",
        },
        { status: 400 }
      );
    }
    const inquiry = await prisma.contactInquiry.findUnique({
      where: {
        id,
      },
    });

    if (!inquiry) {
      return Response.json(
        {
          success: false,
          message: "Contact inquiry not found",
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Contact inquiry fetched successfully",
        inquiry,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Failed in fetching contact inquiry", error);
    return Response.json(
      {
        success: false,
        message: "Failed to fetch contact inquiry",
      },
      {
        status: 500,
      }
    );
  }
}

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
          message: "Contact inquiry id is required",
        },
        { status: 400 }
      );
    }

    const { status } = await request.json();

    if (!status) {
      return Response.json(
        {
          success: false,
          message: "Status is required",
        },
        { status: 400 }
      );
    }

    const updatedInquiry = await prisma.contactInquiry.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });

    return Response.json(
      {
        success: true,
        message: "Contact inquiry updated successfully",
        status: updatedInquiry.status,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Failed in updating contact inquiry", error);

    return Response.json(
      {
        success: false,
        message: "Failed to update contact inquiry",
      },
      {
        status: 500,
      }
    );
  }
}
