import getRecruitmentEventStatus from "@/lib/recruitment-status";

export async function GET() {
  try {
    const status = await getRecruitmentEventStatus();

    return Response.json(
      {
        success: true,
        isOpen: status.isOpen,
        opensAt: status.opensAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch recruitment status:", error);

    return Response.json(
      { success: false, isOpen: false, opensAt: null },
      { status: 500 }
    );
  }
}
