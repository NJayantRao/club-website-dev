"use client";

import axios from "axios";
import { useMutation } from "@tanstack/react-query";

interface ContactSubmission {
  name: string;
  email: string;
  phoneNo: string;
  message: string;
  type: "contact";
}

export function useSubmitContact() {
  return useMutation({
    mutationFn: async (payload: ContactSubmission) => {
      try {
        const { data } = await axios.post("/api/contact-us", payload);
        return data;
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? (err.response?.data?.message ?? err.message ?? "Submission failed")
          : "Submission failed";

        throw new Error(message);
      }
    },
  });
}
