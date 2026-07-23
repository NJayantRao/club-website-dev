import prisma from "@/lib/prisma";
import { MediaUsageType, Prisma } from "@prisma/client";

type Db = Prisma.TransactionClient | typeof prisma;

export async function attachMedia(
  type: MediaUsageType,
  entityId: string,
  url: string,
  db: Db = prisma
) {
  return db.media.create({
    data: {
      url,
      usages: {
        create: { type, entityId },
      },
    },
  });
}

export async function removeMedia(
  type: MediaUsageType,
  entityId: string,
  db: Db = prisma
) {
  const usages = await db.mediaUsage.findMany({
    where: { type, entityId },
    select: { mediaId: true },
  });

  if (usages.length === 0) return;

  await db.media.deleteMany({
    where: { id: { in: usages.map((usage) => usage.mediaId) } },
  });
}

export async function replaceMedia(
  type: MediaUsageType,
  entityId: string,
  url: string,
  db: Db = prisma
) {
  await removeMedia(type, entityId, db);
  return attachMedia(type, entityId, url, db);
}

export async function getMediaUrl(
  type: MediaUsageType,
  entityId: string
): Promise<string | null> {
  const usage = await prisma.mediaUsage.findFirst({
    where: { type, entityId },
    orderBy: { createdAt: "desc" },
    include: { media: true },
  });

  return usage?.media.url ?? null;
}

export async function getMediaUrlMap(
  type: MediaUsageType,
  entityIds: string[]
): Promise<Map<string, string>> {
  if (entityIds.length === 0) return new Map();

  const usages = await prisma.mediaUsage.findMany({
    where: { type, entityId: { in: entityIds } },
    orderBy: { createdAt: "desc" },
    include: { media: true },
  });

  const map = new Map<string, string>();

  for (const usage of usages) {
    if (!map.has(usage.entityId)) {
      map.set(usage.entityId, usage.media.url);
    }
  }

  return map;
}
