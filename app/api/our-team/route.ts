import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(_request: NextRequest) {
  try {
    const members = await prisma.member.findMany();

    return Response.json(
      {
        success: true,
        message: `Team fetched successfully`,
        members,
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
