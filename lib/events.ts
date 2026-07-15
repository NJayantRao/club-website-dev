import prisma from "@/lib/prisma";
import { EventStatusType, EventType } from "@prisma/client";
import { unstable_cache } from "next/cache";

export interface EventItem {
  id: string;
  title: string;
  description?: string | null;
  status: EventStatusType;
  imageUrl: string | null;
  type: EventType;
  startAt: Date;
  venue?: string | null;
  capacity?: number | null;
}

export const getEvents = unstable_cache(
  async (): Promise<EventItem[]> => {
    const events = await prisma.event.findMany({
      orderBy: [{ status: "asc" }, { startAt: "desc" }],
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        imageUrl: true,
        type: true,
        startAt: true,
        venue: true,
        capacity: true,
      },
    });

    return events;
  },
  ["event-list"],
  { tags: ["events"] }
);
