import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const page = parseInt(searchParams.get("page")!) || 1;
  const limit = parseInt(searchParams.get("limit")!) || 5;
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const role = searchParams.get("role") || "MEMBER";

  const skip = (page - 1) * limit;
  try {
    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where: {
          role: role as Role,
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.member.count({ where: { role: Role.MEMBER } }),
    ]);

    return Response.json(
      {
        success: true,
        message: `Team fetched successfully`,
        data: members,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Failed to fetch team:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch team",
      },
      {
        status: 500,
      }
    );
  }
}
