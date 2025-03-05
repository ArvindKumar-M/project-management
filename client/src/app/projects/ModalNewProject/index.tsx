import Modal from "@/components/Modal";
import { useCreateProjectMutation } from "@/state/api";
import React, { ChangeEvent, useState } from "react";
import { formatISO } from "date-fns";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const INITIAL_DATA = {
  name: "",
  description: "",
  startDate: "",
  endDate: "",
};

const ModalNewProject = ({ isOpen, onClose }: Props) => {
  const [createProject, { isLoading }] = useCreateProjectMutation();
  const [formData, setFormData] = useState(INITIAL_DATA);

  const handleSubmit = async () => {
    if (!formData.name || !formData.startDate || !formData.endDate) return;
    const formattedStartDate = formatISO(new Date(formData.startDate), {
      representation: "complete",
    });
    const formattedEndDate = formatISO(new Date(formData.endDate), {
      representation: "complete",
    });
    await createProject({
      name: formData.name,
      description: formData.description,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
    });
    setFormData(INITIAL_DATA);
    onClose();
  };

  const handleFormDataChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isFormValid = () => {
    return (
      formData.name &&
      formData.description &&
      formData.startDate &&
      formData.endDate
    );
  };

  const inputStyles =
    "w-full rounded border border-gray-300 p-2 shadow-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none";

  return (
    <Modal isOpen={isOpen} onClose={onClose} name="Create a New Project">
      <form
        className="mt-4 space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <input
          type="text"
          className={inputStyles}
          name="name"
          value={formData.name}
          onChange={handleFormDataChange}
          placeholder="Project Name"
        />
        <textarea
          className={inputStyles}
          name="description"
          value={formData.description}
          onChange={handleFormDataChange}
          placeholder="Description"
        />
        <div className="grid-cold-1 grid gap-6 sm:grid-cols-2 sm:gap-2">
          <input
            type="date"
            className={inputStyles}
            name="startDate"
            value={formData.startDate}
            onChange={handleFormDataChange}
            placeholder="Start Date"
          />
          <input
            type="date"
            className={inputStyles}
            name="endDate"
            value={formData.endDate}
            onChange={handleFormDataChange}
            placeholder="End Date"
          />
        </div>
        <button
          type="submit"
          className={`focus-offset-2 mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white hover:bg-blue-600 focus:ring-blue-600 ${!isFormValid() || isLoading ? "cursor-not-allowed opacity-50" : ""}`}
          disabled={!isFormValid() || isLoading}
        >
          {isLoading ? "creating..." : "Create Project"}
        </button>
      </form>
    </Modal>
  );
};

export default ModalNewProject;
