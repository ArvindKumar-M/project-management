import { Status, Priority, useEditTaskMutation, Task } from "@/state/api";
import { formatISO, isValid } from "date-fns";
import React, { ChangeEvent, useEffect, useState } from "react";
import { formatDateForInput } from "@/lib/utils";
import Modal from "../Modal";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  taskId?: number | null;
  tasks: Task[];
};

const ModalEditTask = ({ isOpen, onClose, taskId, tasks }: Props) => {
  const [editTask, { isLoading }] = useEditTaskMutation();
  const taskToEdit = tasks.find((task) => task.id === taskId);
  const [editTaskData, setEditTaskData] = useState<Task | null>(
    taskToEdit || null,
  );

  const handleSubmit = async () => {
    if (!editTaskData || !editTaskData.id) return;

    let formattedStartDate: string | undefined = undefined;
    if (editTaskData.startDate) {
      const startDate = new Date(editTaskData.startDate);
      if (isValid(startDate)) {
        formattedStartDate = formatISO(startDate, {
          representation: "complete",
        });
      }
    }
    let formattedDueDate: string | undefined = undefined;
    if (editTaskData.dueDate) {
      const dueDate = new Date(editTaskData.dueDate);
      if (isValid(dueDate)) {
        formattedDueDate = formatISO(dueDate, { representation: "complete" });
      }
    }
    await editTask({
      id: editTaskData.id,
      task: {
        title: editTaskData.title,
        description: editTaskData.description,
        status: editTaskData.status,
        priority: editTaskData.priority,
        tags: editTaskData.tags,
        startDate: formattedStartDate,
        dueDate: formattedDueDate,
        assignedUserId: editTaskData.assignedUserId,
      },
    });
    onClose();
  };

  const handleModalClose = () => {
    setEditTaskData(taskToEdit as Task);
    onClose();
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setEditTaskData((prevData) => {
      if (!prevData) return null;
      return {
        ...prevData,
        [name]: value,
      };
    });
  };

  const hasChanges = () => {
    if (!taskToEdit || !editTaskData) return null;

    return Object.keys(taskToEdit).some((key) => {
      return taskToEdit[key as keyof Task] !== editTaskData[key as keyof Task];
    });
  };

  const selectStyles =
    "mb-4 block w-full rounded border border-gray-300 px-3 py-2 dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none";
  const inputStyles =
    "w-full rounded border border-gray-300 p-2 shadow-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none";

  useEffect(() => {
    if (taskToEdit) {
      setEditTaskData(taskToEdit);
    }
  }, [taskToEdit]);

  if (!taskToEdit) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose} name="Edit Task">
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
          name="title"
          value={editTaskData?.title ?? ""}
          onChange={handleChange}
          placeholder="Title"
        />
        <textarea
          className={inputStyles}
          name="description"
          value={editTaskData?.description ?? ""}
          onChange={handleChange}
          placeholder="Description"
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2">
          <select
            className={selectStyles}
            name="status"
            value={editTaskData?.status ?? ""}
            onChange={handleChange}
          >
            <option value="">Select Status</option>
            <option value={Status.ToDo}>To Do</option>
            <option value={Status.WorkInProgress}>Work In Progress</option>
            <option value={Status.UnderReview}>Under Review</option>
            <option value={Status.Completed}>Completed</option>
          </select>
          <select
            className={selectStyles}
            name="priority"
            value={editTaskData?.priority ?? ""}
            onChange={handleChange}
          >
            <option value="">Select Priority</option>
            <option value={Priority.Urgent}>Urgent</option>
            <option value={Priority.High}>High</option>
            <option value={Priority.Medium}>Medium</option>
            <option value={Priority.Low}>Low</option>
            <option value={Priority.Backlog}>Backlog</option>
          </select>
        </div>
        <input
          type="text"
          className={inputStyles}
          name="tags"
          value={editTaskData?.tags ?? ""}
          onChange={handleChange}
          placeholder="Tags (comma separated)"
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2">
          <input
            type="date"
            className={inputStyles}
            name="startDate"
            value={formatDateForInput(editTaskData?.startDate ?? "")}
            onChange={handleChange}
          />
          <input
            type="date"
            className={inputStyles}
            name="dueDate"
            value={formatDateForInput(editTaskData?.dueDate ?? "")}
            onChange={handleChange}
          />
        </div>
        <input
          type="text"
          className={inputStyles}
          name="assignedUserId"
          value={editTaskData?.assignedUserId ?? ""}
          onChange={handleChange}
          placeholder="Assigned User ID"
        />
        <button
          type="submit"
          className={`focus-offset-2 mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline focus:ring-2 focus:ring-blue-600 ${!hasChanges() || isLoading ? "cursor-not-allowed opacity-50" : ""}`}
          disabled={!hasChanges() || isLoading}
        >
          {isLoading ? "Saving..." : "Submit"}
        </button>
      </form>
    </Modal>
  );
};

export default ModalEditTask;
