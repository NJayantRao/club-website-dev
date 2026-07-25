"use client";

import { useState } from "react";
import { FieldType } from "@prisma/client";
import { Plus, Pencil, Trash2 } from "lucide-react";
import FieldModal from "./FieldModal";
import Popup from "./Popup";
import { useEvent, EventFormField } from "@/hooks/useEvents";
import { useDeleteEventField, useSaveEventField } from "@/hooks/useEventfields";

interface Props {
  id: string;
}

interface FieldValues {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder: string;
}

export default function EventFields({ id }: Props) {
  const { data: event, isLoading: loading } = useEvent(id);
  const fields = event?.formFields ?? [];

  const [showModal, setShowModal] = useState(false);
  const [editingField, setEditingField] = useState<EventFormField | null>(null);

  const saveField = useSaveEventField(id);
  const deleteField = useDeleteEventField(id);

  const [popup, setPopup] = useState({
    show: false,
    type: "success" as const,
    message: "",
    isConfirm: false,
    onConfirm: () => {},
  });

  const openAdd = () => {
    setEditingField(null);
    setShowModal(true);
  };

  const openEdit = (field: EventFormField) => {
    setEditingField(field);
    setShowModal(true);
  };

  const onSubmitField = async (values: FieldValues) => {
    try {
      await saveField.mutateAsync({
        fieldId: editingField?.id ?? null,
        values,
        order: fields.length,
      });

      setShowModal(false);
      setEditingField(null);
    } catch (err) {
      console.error(err);
      setPopup({
        show: true,
        type: "success",
        message: "Unable to save this field.",
        isConfirm: false,
        onConfirm: () => {},
      });
    }
  };

  const confirmDelete = (field: EventFormField) => {
    setPopup({
      show: true,
      type: "success",
      message: `Delete field "${field.label}"?`,
      isConfirm: true,
      onConfirm: async () => {
        setPopup((p) => ({ ...p, show: false }));

        try {
          await deleteField.mutateAsync(field.id);
        } catch (err) {
          console.error(err);
          setPopup({
            show: true,
            type: "success",
            message: "Unable to delete this field.",
            isConfirm: false,
            onConfirm: () => {},
          });
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Registration Form</h2>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-black"
        >
          {" "}
          <Plus className="h-4 w-4" />
          Add Field
        </button>
      </div>

      <div className="space-y-3">
        {fields.length === 0 && (
          <p className="rounded-2xl border border-dashed border-white/10 py-16 text-center text-neutral-500">
            No registration fields yet. Add one to start building the form.
          </p>
        )}

        {fields.map((field) => (
          <div
            key={field.id}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#111] p-5"
          >
            <div>
              <h3 className="font-semibold text-white">{field.label}</h3>

              <p className="text-sm text-neutral-500">{field.type}</p>

              {field.required && (
                <span className="mt-2 inline-block rounded-full bg-red-500/20 px-3 py-1 text-xs text-red-300">
                  Required
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => openEdit(field)}
                className="rounded-lg p-2 hover:bg-white/10"
              >
                <Pencil className="h-4 w-4 text-white" />
              </button>

              <button
                onClick={() => confirmDelete(field)}
                className="rounded-lg p-2 hover:bg-red-500/20"
              >
                <Trash2 className="h-4 w-4 text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <FieldModal
        open={showModal}
        loading={saveField.isPending}
        initialValues={
          editingField
            ? {
                name: editingField.name,
                label: editingField.label,
                type: editingField.type,
                required: editingField.required,
                placeholder: editingField.placeholder ?? "",
              }
            : undefined
        }
        onClose={() => {
          setShowModal(false);
          setEditingField(null);
        }}
        onSubmit={onSubmitField}
      />

      <Popup
        show={popup.show}
        type={popup.type}
        message={popup.message}
        isConfirm={popup.isConfirm}
        onConfirm={popup.onConfirm}
        onClose={() => setPopup((p) => ({ ...p, show: false }))}
      />
    </div>
  );
}
