import React from "react";
import { X } from "lucide-react";

type ConfirmationModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmBtnText: string;
  cancelBtnText: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmationModal = (props: ConfirmationModalProps) => {
  const {
    isOpen,
    title,
    message,
    confirmBtnText,
    cancelBtnText,
    onCancel,
    onConfirm,
  } = props;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-medium">{title}</h3>
        <p className="mb-6 text-gray-600">{message}</p>
        <button
          className="absolute right-2 top-2 rounded-full p-1 text-center hover:bg-slate-200"
          onClick={onCancel}
        >
          <X size={16} />
        </button>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={onCancel}
          >
            {cancelBtnText}
          </button>
          <button
            type="button"
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            onClick={onConfirm}
          >
            {confirmBtnText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
