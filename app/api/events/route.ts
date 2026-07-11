import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { requireAdminAuth } from "@/lib/authorize-admin";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth();

    if (!auth.success) {
      return auth.response;
    }

    const user = auth.user;

    const {
      title,
      description,
      type,
      startAt,
      endAt,
      venue,
      registrationStart,
      registrationEnd,
      capacity,
    } = await request.json();

    if (!title) {
      return Response.json(
        { success: false, message: "Title is required" },
        { status: 400 }
      );
    } else if (!type) {
      return Response.json(
        { success: false, message: "Type is required" },
        { status: 400 }
      );
    } else if (!startAt) {
      return Response.json(
        { success: false, message: "Start date is required" },
        { status: 400 }
      );
    } else if (!user) {
      return Response.json(
        { success: false, message: "User not authorized" },
        { status: 403 }
      );
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        type,
        startAt,
        endAt,
        venue,
        registrationStart,
        registrationEnd,
        capacity,
        createdBy: user?.id,
      },
    });

    return Response.json(
      {
        success: true,
        message: `Event ${event.title} registered successfully`,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Failed in registering event", error);
    return Response.json(
      {
        success: false,
        message: "Failed to register event",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get("page")!) || 1;
    const limit = parseInt(searchParams.get("limit")!) || 5;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const skip = (page - 1) * limit;

    const events = await prisma.event.findMany({
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder as "asc" | "desc",
      },
    });

    return Response.json(
      {
        success: true,
        message: `Event fetched successfully`,
        events,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Failed in fetching events", error);
    return Response.json(
      {
        success: false,
        message: "Failed to fetching events",
      },
      {
        status: 500,
      }
    );
  }
}
