import { Status, Priority, useCreateTaskMutation } from "@/state/api";
import { formatISO, isValid } from "date-fns";
import React, { ChangeEvent, useState } from "react";
import Modal from "../Modal";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  id?: string | null;
};

const INITIAL_TASK_DATA = {
  title: "",
  description: "",
  status: Status.ToDo,
  priority: Priority.Backlog,
  tags: "",
  startDate: "",
  dueDate: "",
  authorUserId: "",
  assignedUserId: "",
  projectId: "",
};

const ModalNewTask = ({ isOpen, onClose, id = null }: Props) => {
  const [createTask, { isLoading }] = useCreateTaskMutation();
  const [newTaskData, setNewTaskData] = useState(INITIAL_TASK_DATA);

  const handleSubmit = async () => {
    if (
      !newTaskData.title ||
      !newTaskData.authorUserId ||
      !(id !== null || newTaskData.projectId)
    )
      return;

    let formattedStartDate: string | undefined = undefined;
    if (newTaskData.startDate) {
      const startDate = new Date(newTaskData.startDate);
      if (isValid(startDate)) {
        formattedStartDate = formatISO(startDate, {
          representation: "complete",
        });
      }
    }
    let formattedDueDate: string | undefined = undefined;
    if (newTaskData.dueDate) {
      const dueDate = new Date(newTaskData.dueDate);
      if (isValid(dueDate)) {
        formattedDueDate = formatISO(dueDate, { representation: "complete" });
      }
    }

    await createTask({
      title: newTaskData.title,
      description: newTaskData.description,
      status: newTaskData.status,
      priority: newTaskData.priority,
      tags: newTaskData.tags,
      startDate: formattedStartDate,
      dueDate: formattedDueDate,
      authorUserId: parseInt(newTaskData.authorUserId),
      assignedUserId: parseInt(newTaskData.assignedUserId),
      projectId: id !== null ? Number(id) : Number(newTaskData.projectId),
    });
    setNewTaskData(INITIAL_TASK_DATA);
    onClose();
  };

  const handleModalClose = () => {
    setNewTaskData(INITIAL_TASK_DATA);
    onClose();
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setNewTaskData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const isFormValid = () => {
    return (
      newTaskData.title &&
      newTaskData.authorUserId &&
      !(id !== null || newTaskData.projectId)
    );
  };

  const selectStyles =
    "mb-4 block w-full rounded border border-gray-300 px-3 py-2 dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none";
  const inputStyles =
    "w-full rounded border border-gray-300 p-2 shadow-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none";

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose} name="Create New Task">
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
          value={newTaskData.title}
          onChange={handleChange}
          placeholder="Title"
        />
        <textarea
          className={inputStyles}
          name="description"
          value={newTaskData.description}
          onChange={handleChange}
          placeholder="Description"
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2">
          <select
            className={selectStyles}
            name="status"
            value={newTaskData.status}
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
            value={newTaskData.priority}
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
          value={newTaskData.tags}
          onChange={handleChange}
          placeholder="Tags (comma separated)"
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2">
          <input
            type="date"
            className={inputStyles}
            name="startDate"
            value={newTaskData.startDate}
            onChange={handleChange}
          />
          <input
            type="date"
            className={inputStyles}
            name="dueDate"
            value={newTaskData.dueDate}
            onChange={handleChange}
          />
        </div>
        <input
          type="text"
          className={inputStyles}
          name="authorUserId"
          value={newTaskData.authorUserId}
          onChange={handleChange}
          placeholder="Author User ID"
        />
        <input
          type="text"
          className={inputStyles}
          name="assignedUserId"
          value={newTaskData.assignedUserId}
          onChange={handleChange}
          placeholder="Assigned User ID"
        />
        {id === null && (
          <input
            type="text"
            className={inputStyles}
            name="projectId"
            value={newTaskData.projectId}
            onChange={handleChange}
            placeholder="Project ID"
          />
        )}
        <button
          type="submit"
          className={`focus-offset-2 mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline focus:ring-2 focus:ring-blue-600 ${!isFormValid() || isLoading ? "cursor-not-allowed opacity-50" : ""}`}
          disabled={!isFormValid() || isLoading}
        >
          {isLoading ? "Creating..." : "Create Task"}
        </button>
      </form>
    </Modal>
  );
};

export default ModalNewTask;
