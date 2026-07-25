"use client";

import axios from "axios";
import { useQuery } from "@tanstack/react-query";

interface DashboardStats {
  members: number;
  events: number;
  queries: number;
  recruits: number;
}

export function useDashboardStats(enabled: boolean) {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardStats> => {
      const [mRes, eRes, qRes, rRes] = await Promise.all([
        axios.get("/api/our-team?role=ALL&limit=1"),
        axios.get("/api/events?limit=1"),
        axios.get("/api/contact-us?limit=1"),
        axios.get("/api/recruitment?limit=1"),
      ]);

      return {
        members: mRes.data.pagination?.total ?? 0,
        events: eRes.data.pagination?.total ?? 0,
        queries: qRes.data.pagination?.total ?? 0,
        recruits: rRes.data.pagination?.total ?? 0,
      };
    },
    enabled,
  });
}
