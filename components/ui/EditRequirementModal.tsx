"use client";

import React, { useState } from "react";
import EditModalShell from "./EditModelShell";
import { SelectField, TextField } from "./FormField";

export interface RecruitmentRecord {
  id: string;
  name: string;
  rollNo: string;
  instituteEmail: string;
  personalEmail: string;
  gender: string;
  branch: string;
  phoneNo: string;
  locality: string;
  techStack: string;
  isSelected: boolean;
}

export type RecruitmentFormData = Omit<
  RecruitmentRecord,
  "id" | "isSelected"
> & {
  isSelected: boolean;
};

type FieldErrors = Partial<Record<keyof RecruitmentFormData, string>>;

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const INSTITUTE_EMAIL_RE = /^[a-zA-Z0-9._%+-]+@nist\.edu$/i;
const PHONE_RE = /^\+?[0-9\s-]{7,15}$/;
const ROLL_NO_RE = /^[a-zA-Z0-9-\/]{3,20}$/;

const toFormData = (record: RecruitmentRecord): RecruitmentFormData => ({
  name: record.name,
  rollNo: record.rollNo,
  instituteEmail: record.instituteEmail,
  personalEmail: record.personalEmail,
  gender: record.gender,
  branch: record.branch,
  phoneNo: record.phoneNo,
  locality: record.locality,
  techStack: record.techStack,
  isSelected: record.isSelected,
});

const validate = (form: RecruitmentFormData): FieldErrors => {
  const errors: FieldErrors = {};

  if (!form.name.trim()) {
    errors.name = "Required";
  } else if (form.name.trim().length < 2) {
    errors.name = "Name is too short";
  }

  if (!form.rollNo.trim()) {
    errors.rollNo = "Required";
  } else if (!ROLL_NO_RE.test(form.rollNo.trim())) {
    errors.rollNo = "Invalid roll number";
  }

  if (!form.branch.trim()) errors.branch = "Required";
  if (!form.locality.trim()) errors.locality = "Required";
  if (!form.techStack.trim()) errors.techStack = "Required";

  if (!form.instituteEmail.trim()) {
    errors.instituteEmail = "Required";
  } else if (!INSTITUTE_EMAIL_RE.test(form.instituteEmail.trim())) {
    errors.instituteEmail = "Must be a valid @nist.edu email";
  }

  if (!form.personalEmail.trim()) {
    errors.personalEmail = "Required";
  } else if (!EMAIL_RE.test(form.personalEmail.trim())) {
    errors.personalEmail = "Invalid email";
  } else if (INSTITUTE_EMAIL_RE.test(form.personalEmail.trim())) {
    errors.personalEmail = "Use a non-institute email here";
  }

  if (!form.phoneNo.trim()) {
    errors.phoneNo = "Required";
  } else if (!PHONE_RE.test(form.phoneNo.trim())) {
    errors.phoneNo = "Invalid phone number";
  }

  return errors;
};

interface EditRecruitmentModalProps {
  record: RecruitmentRecord;
  isSaving: boolean;
  onClose: () => void;
  onSave: (id: string, data: RecruitmentFormData) => Promise<void> | void;
}

const EditRecruitmentModal = ({
  record,
  isSaving,
  onClose,
  onSave,
}: EditRecruitmentModalProps) => {
  const [form, setForm] = useState<RecruitmentFormData>(() =>
    toFormData(record)
  );
  const [errors, setErrors] = useState<FieldErrors>({});

  const updateField = <K extends keyof RecruitmentFormData>(
    key: K,
    value: RecruitmentFormData[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    await onSave(record.id, form);
  };

  return (
    <EditModalShell
      title="Edit Application"
      subtitle="Correct any mistakes the applicant made in their submission."
      isSaving={isSaving}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <TextField
        label="Name"
        value={form.name}
        onChange={(e) => updateField("name", e.target.value)}
        error={errors.name}
      />

      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Roll No."
          value={form.rollNo}
          onChange={(e) => updateField("rollNo", e.target.value)}
          error={errors.rollNo}
        />
        <TextField
          label="Branch"
          value={form.branch}
          onChange={(e) => updateField("branch", e.target.value)}
          error={errors.branch}
        />
      </div>

      <TextField
        label="Institute Email"
        type="email"
        value={form.instituteEmail}
        onChange={(e) => updateField("instituteEmail", e.target.value)}
        error={errors.instituteEmail}
      />

      <TextField
        label="Personal Email"
        type="email"
        value={form.personalEmail}
        onChange={(e) => updateField("personalEmail", e.target.value)}
        error={errors.personalEmail}
      />

      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Phone No."
          value={form.phoneNo}
          onChange={(e) => updateField("phoneNo", e.target.value)}
          error={errors.phoneNo}
        />
        <TextField
          label="Gender"
          value={form.gender}
          onChange={(e) => updateField("gender", e.target.value)}
        />
      </div>

      <TextField
        label="Locality"
        value={form.locality}
        onChange={(e) => updateField("locality", e.target.value)}
        error={errors.locality}
      />

      <TextField
        label="Tech Stack"
        value={form.techStack}
        onChange={(e) => updateField("techStack", e.target.value)}
        error={errors.techStack}
        placeholder="React, Node.js, MongoDB"
      />

      <SelectField
        label="Selection Status"
        value={form.isSelected ? "selected" : "pending"}
        onChange={(e) =>
          updateField("isSelected", e.target.value === "selected")
        }
        options={[
          { label: "Pending", value: "pending" },
          { label: "Selected", value: "selected" },
        ]}
      />
    </EditModalShell>
  );
};

export default EditRecruitmentModal;
