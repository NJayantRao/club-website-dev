import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/authorize-admin";

export async function GET(
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
    const auth = await requireAdminAuth();

    if (!auth.success) {
      return auth.response;
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
