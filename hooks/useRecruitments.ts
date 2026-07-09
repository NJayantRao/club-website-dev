import { useEffect, useState } from "react";

interface FetchParams {
  page?: number;
  limit?: number;
  type?: string;
}

const fetchRecruitment = async (params: FetchParams = {}) => {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.type) query.set("type", params.type);

  const res = await fetch(`/api/recruitment?${query}`);

  if (!res.ok) {
    throw new Error("Failed to fetch recruitment");
  }

  return res.json();
};

export function useRecruitmentList(params: FetchParams = {}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await fetchRecruitment(params);

        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [params.page, params.limit, params.type]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchRecruitment(params).then(setData),
  };
}

export function useSubmitRecruitment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submitRecruitment = async (data: any) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/recruitment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Submission failed");
      }

      return await res.json();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitRecruitment,
    loading,
    error,
  };
}
