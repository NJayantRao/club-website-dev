"use client";

import React, { useState } from "react";
import EditModalShell from "./EditModelShell";
import { SelectField, TextAreaField, TextField } from "./FormField";
export interface RecruitmentDriveFormData {
  title: string;
  description: string;
  year: number;
  status: "UPCOMING" | "OPEN" | "CLOSED";
  registrationStart: string;
  registrationEnd: string;
}

type FieldErrors = Partial<Record<"title" | "year", string>>;

const currentYear = new Date().getFullYear();

const EMPTY_FORM: RecruitmentDriveFormData = {
  title: `Recruitment Drive ${currentYear}`,
  description: "",
  year: currentYear,
  status: "UPCOMING",
  registrationStart: "",
  registrationEnd: "",
};

const validate = (form: RecruitmentDriveFormData): FieldErrors => {
  const errors: FieldErrors = {};

  if (!form.title.trim()) errors.title = "Required";
  if (!form.year) errors.year = "Required";

  return errors;
};

interface RecruitmentDriveModalProps {
  isSaving: boolean;
  onClose: () => void;
  onCreate: (data: RecruitmentDriveFormData) => Promise<void> | void;
}

const RecruitmentDriveModal = ({
  isSaving,
  onClose,
  onCreate,
}: RecruitmentDriveModalProps) => {
  const [form, setForm] = useState<RecruitmentDriveFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});

  const updateField = <K extends keyof RecruitmentDriveFormData>(
    key: K,
    value: RecruitmentDriveFormData[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    await onCreate(form);
  };

  return (
    <EditModalShell
      title="New Recruitment Drive"
      subtitle="Start a fresh recruitment cycle with its own form and applications."
      isSaving={isSaving}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel="Create Drive"
      savingLabel="Creating..."
    >
      <TextField
        label="Title"
        value={form.title}
        onChange={(e) => updateField("title", e.target.value)}
        error={errors.title}
      />

      <TextAreaField
        label="Description"
        optional
        value={form.description}
        onChange={(e) => updateField("description", e.target.value)}
        rows={3}
      />

      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Year"
          type="number"
          value={form.year}
          onChange={(e) => updateField("year", Number(e.target.value))}
          error={errors.year}
        />
        <SelectField
          label="Status"
          value={form.status}
          onChange={(e) =>
            updateField(
              "status",
              e.target.value as RecruitmentDriveFormData["status"]
            )
          }
          options={[
            { label: "Upcoming", value: "UPCOMING" },
            { label: "Open", value: "OPEN" },
            { label: "Closed", value: "CLOSED" },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Registration Start"
          optional
          type="datetime-local"
          value={form.registrationStart}
          onChange={(e) => updateField("registrationStart", e.target.value)}
        />
        <TextField
          label="Registration End"
          optional
          type="datetime-local"
          value={form.registrationEnd}
          onChange={(e) => updateField("registrationEnd", e.target.value)}
        />
      </div>
    </EditModalShell>
  );
};

export default RecruitmentDriveModal;
