import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { NextRequest } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, email, phoneNo, message } = await request.json();

    if (!name || !email || !phoneNo || !message) {
      return Response.json(
        {
          success: false,
          message: "All fields are required",
        },
        {
          status: 400,
        }
      );
    }

    const inquiry = await prisma.contactInquiry.create({
      data: {
        name,
        email,
        phoneNo,
        message,
      },
    });

    return Response.json(
      {
        success: true,
        message: "Your inquiry has been submitted successfully.",
        inquiry,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Failed to submit contact inquiry", error);

    return Response.json(
      {
        success: false,
        message: "Failed to submit contact inquiry",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get("page")!) || 1;
    const limit = parseInt(searchParams.get("limit")!) || 5;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const skip = (page - 1) * limit;

    const inquiries = await prisma.contactInquiry.findMany({
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder as "asc" | "desc",
      },
    });

    return Response.json(
      {
        success: true,
        message: "Contact Inquiries fetched successfully",
        inquiries,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Failed in fetching contact inquiries", error);
    return Response.json(
      {
        success: false,
        message: "Failed to fetch contact inquiries",
      },
      {
        status: 500,
      }
    );
  }
}
