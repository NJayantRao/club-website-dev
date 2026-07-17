import axios from "axios";
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

  const { data } = await axios.get(`/api/recruitment?${query}`);

  return data;
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

      const response = await axios.post("/api/recruitment", data);

      return response.data;
    } catch (err: any) {
      const error =
        err.response?.data?.message ?? err.message ?? "Submission failed";

      const newError = new Error(error);
      setError(newError);
      throw newError;
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
