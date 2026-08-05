"use client";

import React, { useState } from "react";
import EditModalShell from "./EditModelShell";
import { ReadOnlyField, SelectField, TextField } from "./FormField";

export interface EventResponseRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  college: string | null;
  attendance: boolean;
  answers: Record<string, unknown>;
}

export interface EventFormFieldLite {
  name: string;
  label: string;
  type: "TEXT" | "TEXTAREA" | "URL" | "NUMBER" | "EMAIL" | "PHONE" | "FILE";
  required: boolean;
}

interface ResponseFormData {
  name: string;
  email: string;
  phone: string;
  college: string;
  attendance: boolean;
  answers: Record<string, string>;
}

type FieldErrors = Partial<Record<"name" | "email" | "phone", string>> & {
  answers?: Record<string, string>;
};

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const URL_RE = /^https?:\/\/\S+/;
const NUMBER_RE = /^\d+$/;
const PHONE_RE = /^\+?[0-9\s-]{7,15}$/;

const toFormData = (
  record: EventResponseRecord,
  formFields: EventFormFieldLite[]
): ResponseFormData => {
  const answers: Record<string, string> = {};

  for (const field of formFields) {
    const value = record.answers?.[field.name];
    answers[field.name] =
      value === undefined || value === null ? "" : String(value);
  }

  return {
    name: record.name,
    email: record.email,
    phone: record.phone ?? "",
    college: record.college ?? "",
    attendance: record.attendance,
    answers,
  };
};

const validate = (
  form: ResponseFormData,
  formFields: EventFormFieldLite[]
): FieldErrors => {
  const errors: FieldErrors = {};

  if (!form.name.trim()) errors.name = "Required";

  if (!form.email.trim()) {
    errors.email = "Required";
  } else if (!EMAIL_RE.test(form.email.trim())) {
    errors.email = "Invalid email";
  }

  if (form.phone.trim() && !PHONE_RE.test(form.phone.trim())) {
    errors.phone = "Invalid phone number";
  }

  const answerErrors: Record<string, string> = {};

  for (const field of formFields) {
    if (field.type === "FILE") continue;

    const value = form.answers[field.name]?.trim() ?? "";

    if (field.required && !value) {
      answerErrors[field.name] = "Required";
      continue;
    }

    if (!value) continue;

    switch (field.type) {
      case "EMAIL":
        if (!EMAIL_RE.test(value)) answerErrors[field.name] = "Invalid email";
        break;
      case "URL":
        if (!URL_RE.test(value)) answerErrors[field.name] = "Invalid URL";
        break;
      case "NUMBER":
        if (!NUMBER_RE.test(value))
          answerErrors[field.name] = "Must be numeric";
        break;
      case "PHONE":
        if (!PHONE_RE.test(value))
          answerErrors[field.name] = "Invalid phone number";
        break;
      default:
        break;
    }
  }

  if (Object.keys(answerErrors).length > 0) errors.answers = answerErrors;

  return errors;
};

interface EditResponseModalProps {
  record: EventResponseRecord;
  formFields: EventFormFieldLite[];
  isSaving: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    data: {
      name: string;
      email: string;
      phone: string | null;
      college: string | null;
      attendance: boolean;
      answers: Record<string, string>;
    }
  ) => Promise<void> | void;
}

const EditResponseModal = ({
  record,
  formFields,
  isSaving,
  onClose,
  onSave,
}: EditResponseModalProps) => {
  const [form, setForm] = useState<ResponseFormData>(() =>
    toFormData(record, formFields)
  );
  const [errors, setErrors] = useState<FieldErrors>({});

  const updateField = <K extends keyof Omit<ResponseFormData, "answers">>(
    key: K,
    value: ResponseFormData[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const updateAnswer = (name: string, value: string) =>
    setForm((prev) => ({
      ...prev,
      answers: { ...prev.answers, [name]: value },
    }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nextErrors = validate(form, formFields);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    await onSave(record.id, {
      name: form.name,
      email: form.email,
      phone: form.phone.trim() ? form.phone : null,
      college: form.college.trim() ? form.college : null,
      attendance: form.attendance,
      answers: form.answers,
    });
  };

  return (
    <EditModalShell
      title="Edit Response"
      subtitle="Correct any mistakes the registrant made in their submission."
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

      <TextField
        label="Email"
        type="email"
        value={form.email}
        onChange={(e) => updateField("email", e.target.value)}
        error={errors.email}
      />

      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Phone"
          optional
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          error={errors.phone}
        />
        <TextField
          label="College"
          optional
          value={form.college}
          onChange={(e) => updateField("college", e.target.value)}
        />
      </div>

      <SelectField
        label="Attendance"
        value={form.attendance ? "attended" : "pending"}
        onChange={(e) =>
          updateField("attendance", e.target.value === "attended")
        }
        options={[
          { label: "Pending", value: "pending" },
          { label: "Attended", value: "attended" },
        ]}
      />

      {formFields.length > 0 && (
        <div className="space-y-5 border-t border-white/10 pt-5">
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-black">
            Custom Form Answers
          </p>

          {formFields.map((field) =>
            field.type === "FILE" ? (
              <ReadOnlyField
                key={field.name}
                label={field.label}
                value={String(record.answers?.[field.name] ?? "")}
              />
            ) : field.type === "TEXTAREA" ? (
              <div key={field.name}>
                <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-black">
                  {field.label}
                  {errors.answers?.[field.name] && (
                    <span className="ml-2 normal-case tracking-normal text-red-400">
                      — {errors.answers[field.name]}
                    </span>
                  )}
                </label>
                <textarea
                  rows={3}
                  value={form.answers[field.name] ?? ""}
                  onChange={(e) => updateAnswer(field.name, e.target.value)}
                  className={`w-full mt-1 rounded-xl bg-white/5 border px-4 py-3 text-white text-sm resize-none outline-none transition ${
                    errors.answers?.[field.name]
                      ? "border-red-500"
                      : "border-white/10 focus:border-white/20"
                  }`}
                />
              </div>
            ) : (
              <TextField
                key={field.name}
                label={field.label}
                value={form.answers[field.name] ?? ""}
                onChange={(e) => updateAnswer(field.name, e.target.value)}
                error={errors.answers?.[field.name]}
              />
            )
          )}
        </div>
      )}
    </EditModalShell>
  );
};

export default EditResponseModal;
