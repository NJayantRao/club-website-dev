import { useState } from "react";
import { initialMembers } from "@/data/initial-members";

interface FetchMembersParams {
  page?: number;
  limit?: number;
  category?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function useMembers(params: FetchMembersParams = {}) {
  const [members, setMembers] = useState(initialMembers);

  let filteredMembers = members;

  if (params.category) {
    filteredMembers = filteredMembers.filter(
      (member) => member.category === params.category
    );
  }

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
      },
    },
    loading: false,
    error: null,
    setMembers,
  };
}

export function useDeleteMember() {
  return {
    deleteMember: async () => ({ success: true }),
    loading: false,
    error: null,
  };
}
