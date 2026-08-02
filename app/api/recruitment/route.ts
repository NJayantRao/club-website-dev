import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/authorize-admin";
import { revalidateTag, unstable_cache } from "next/cache";
import getRecruitmentEventStatus from "@/lib/recruitment-status";

const getCachedRecruits = unstable_cache(
  async (skip: number, limit: number, sortBy: string, sortOrder: string) => {
    const [recruits, total] = await Promise.all([
      prisma.recruitment.findMany({
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder as "asc" | "desc" },
      }),
      prisma.recruitment.count(),
    ]);

    return { recruits, total };
  },
  ["recruitment-list"],
  { tags: ["recruitment"], revalidate: 86400 }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      rollNo,
      instituteEmail,
      personalEmail,
      gender,
      branch,
      phoneNo,
      locality,
      techStack,
      eventId,
      answers = {},
    } = body;

    if (
      !name ||
      !rollNo ||
      !instituteEmail ||
      !personalEmail ||
      !gender ||
      !branch ||
      !phoneNo ||
      !locality ||
      !techStack
    ) {
      return Response.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    const recruitmentStatus = await getRecruitmentEventStatus();
    const targetEventId = eventId ?? recruitmentStatus.eventId;

    if (!targetEventId) {
      return Response.json(
        {
          success: false,
          message: "No active recruitment event is available right now.",
        },
        { status: 400 }
      );
    }

    const recruitmentEvent = await prisma.event.findUnique({
      where: { id: targetEventId },
      select: {
        id: true,
        formFields: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!recruitmentEvent) {
      return Response.json(
        {
          success: false,
          message: "Recruitment event not found.",
        },
        { status: 404 }
      );
    }

    for (const field of recruitmentEvent.formFields) {
      const value = answers?.[field.name];
      const normalized = typeof value === "string" ? value.trim() : value;

      if (field.required && (!normalized || normalized.length === 0)) {
        return Response.json(
          {
            success: false,
            message: `${field.label} is required.`,
          },
          { status: 400 }
        );
      }

      if (!normalized) continue;

      switch (field.type) {
        case "EMAIL":
          if (!/^\S+@\S+\.\S+$/.test(String(normalized))) {
            return Response.json(
              {
                success: false,
                message: `${field.label} must be a valid email.`,
              },
              { status: 400 }
            );
          }
          break;
        case "NUMBER":
          if (!/^\d+$/.test(String(normalized))) {
            return Response.json(
              {
                success: false,
                message: `${field.label} must be numeric.`,
              },
              { status: 400 }
            );
          }
          break;
        case "PHONE":
          if (!/^\+?[0-9\s-]{7,15}$/.test(String(normalized))) {
            return Response.json(
              {
                success: false,
                message: `${field.label} must be a valid phone number.`,
              },
              { status: 400 }
            );
          }
          break;
        case "URL":
          if (!/^https?:\/\/\S+/.test(String(normalized))) {
            return Response.json(
              {
                success: false,
                message: `${field.label} must be a valid URL.`,
              },
              { status: 400 }
            );
          }
          break;
        default:
          break;
      }
    }

    const recruitment = await prisma.recruitment.create({
      data: {
        name,
        rollNo,
        instituteEmail,
        personalEmail,
        gender,
        branch,
        phoneNo,
        locality,
        techStack,
      },
    });

    try {
      await prisma.eventResponse.create({
        data: {
          eventId: targetEventId,
          name,
          email: personalEmail,
          phone: phoneNo,
          answers: answers ?? {},
        },
      });
    } catch (responseError) {
      console.warn("Recruitment response sync failed:", responseError);
    }

    revalidateTag("recruitment", "max");
    revalidateTag("events", "max");

    return Response.json(
      {
        success: true,
        message: "Application submitted successfully",
        recruitment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to submit recruitment application:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to submit application",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth();

    if (!auth.success) {
      return auth.response;
    }

    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get("page")!) || 1;
    const limit = parseInt(searchParams.get("limit")!) || 15;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const skip = (page - 1) * limit;

    const { recruits, total } = await getCachedRecruits(
      skip,
      limit,
      sortBy,
      sortOrder
    );

    return Response.json(
      {
        success: true,
        message: "Recruitment applications fetched successfully",
        data: recruits,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch recruitment applications:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch recruitment applications",
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const auth = await requireAdminAuth();

    if (!auth.success) {
      return auth.response;
    }

    await prisma.recruitment.deleteMany({});

    revalidateTag("recruitment", "max");

    return Response.json(
      {
        success: true,
        message: "All recruitment applications cleared",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to clear recruitment applications:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to clear recruitment applications",
      },
      { status: 500 }
    );
  }
}
