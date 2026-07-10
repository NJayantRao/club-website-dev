import { useMemo, useState } from "react";
import {
  advisors,
  members as coreMembers,
  alumni,
  type Member,
} from "@/data/initial-members";

interface FetchMembersParams {
  page?: number;
  limit?: number;
  category?: "advisor" | "core" | "alumni";
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const initialMembers: Member[] = [
  ...advisors.map((advisor, index) => ({
    id: `advisor-${index + 1}`,
    name: advisor.name,
    role: advisor.role,
    section: "advisor" as const,
    image: advisor.img,
    socials: [],
  })),

  ...coreMembers.map((member, index) => ({
    id: `core-${index + 1}`,
    name: member.name,
    role: member.role,
    section: "core" as const,
    image: member.img,
    socials: member.linkedin
      ? [
          {
            platform: "linkedin",
            url: member.linkedin,
          },
        ]
      : [],
  })),

  ...alumni.map((member, index) => ({
    id: `alumni-${index + 1}`,
    name: member.name,
    role: member.role,
    section: "alumni" as const,
    image: member.img,
    socials: [],
  })),
];

export function useMembers(params: FetchMembersParams = {}) {
  const [members, setMembers] = useState<Member[]>(initialMembers);

  const filteredMembers = useMemo(() => {
    if (!params.category) return members;

    return members.filter((member) => member.section === params.category);
  }, [members, params.category]);

  const page = params.page ?? 1;
  const limit = params.limit ?? filteredMembers.length;

  const start = (page - 1) * limit;
  const end = start + limit;

  const paginatedMembers = filteredMembers.slice(start, end);

  return {
    data: {
      data: paginatedMembers,
      pagination: {
        page,
        limit,
        total: filteredMembers.length,
        totalPages: Math.max(1, Math.ceil(filteredMembers.length / limit)),
        hasNextPage: end < filteredMembers.length,
        hasPrevPage: page > 1,
      } satisfies PaginationMeta,
    },
    loading: false,
    error: null,
    setMembers,
  };
}

export function useDeleteMember() {
  return {
    deleteMember: async (id: string) => ({ success: true }),
    loading: false,
    error: null,
  };
}
