import {
  useDeleteTaskMutation,
  useGetTasksQuery,
  useUpdateTaskStatusMutation,
} from "@/state/api";
import React, { MouseEvent, useState } from "react";
import {
  DndProvider,
  DragSourceMonitor,
  DropTargetMonitor,
  useDrag,
  useDrop,
} from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Task as TaskType } from "@/state/api";
import {
  Ellipsis,
  EllipsisVertical,
  MessageSquareMore,
  Plus,
  X,
} from "lucide-react";
import Image from "next/image";
import Popover from "@mui/material/Popover";
import Loading from "@/components/Loading";
import ErrorAlert from "@/components/ErrorAlert";
import { formatDate } from "@/lib/utils";
import ActionPopper from "@/components/ActionPopper";
import ModalEditTask from "@/components/ModalEditTask";

type BoardProps = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

const taskStatus = ["To Do", "Work In Progress", "Under Review", "Completed"];

const Board = ({ id, setIsModalNewTaskOpen }: BoardProps) => {
  const {
    data: tasks,
    isLoading,
    error,
  } = useGetTasksQuery({ projectId: Number(id) });
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [isModalEditTaskOpen, setIsModalEditTaskOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const moveTask = (taskId: number, toStatus: string) => {
    updateTaskStatus({ taskId, status: toStatus });
  };

  const handleEdit = (taskId: number) => {
    setSelectedTaskId(taskId);
    setIsModalEditTaskOpen(true);
  };

  if (isLoading) return <Loading />;
  if (error)
    return (
      <ErrorAlert error="An error occurred while fetching project tasks" />
    );

  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
          {taskStatus.map((status) => (
            <TaskColumn
              key={status}
              status={status}
              tasks={tasks || []}
              moveTask={moveTask}
              setIsModalNewTaskOpen={setIsModalNewTaskOpen}
              handleEdit={handleEdit}
            />
          ))}
        </div>
      </DndProvider>
      <ModalEditTask
        tasks={tasks || []}
        projectId={id}
        taskId={selectedTaskId}
        isOpen={isModalEditTaskOpen}
        onClose={() => setIsModalEditTaskOpen(false)}
      />
    </>
  );
};

type TaskColumnProps = {
  status: string;
  tasks: TaskType[];
  moveTask: (taskId: number, toStatus: string) => void;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  handleEdit: (taskId: number) => void;
};

const TaskColumn = ({
  status,
  tasks,
  moveTask,
  setIsModalNewTaskOpen,
  handleEdit,
}: TaskColumnProps) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "task",
    drop: (item: { id: number }) => moveTask(item.id, status),
    collect: (monitor: DropTargetMonitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const tasksCount = tasks.filter((task) => task.status === status).length;

  const statusColor: { [key: string]: string } = {
    "To Do": "#2563EB",
    "Work In Progress": "#059669",
    "Under Review": "#D97706",
    Completed: "#000000",
  };
  return (
    <div
      ref={(instance) => {
        drop(instance);
      }}
      className={`sl:py-4 rounded-lg py-2 xl:px-2 ${isOver ? "bg-blue-100 dark:bg-neutral-950" : ""}`}
    >
      <div className="mb-3 flex w-full">
        <div
          className={`w-2 !bg-[${statusColor[status]}] rounded-s-lg`}
          style={{ backgroundColor: statusColor[status] }}
        />
        <div className="flex w-full items-center justify-between rounded-e-lg bg-white px-5 py-4 dark:bg-dark-secondary">
          <h3 className="flex items-center text-lg font-semibold dark:text-white">
            {status}
            <span
              className="ml-2 inline-block rounded-full bg-gray-200 p-1 text-center text-sm leading-none dark:bg-dark-tertiary"
              style={{ width: "1.5rem", height: "1.5rem" }}
            >
              {tasksCount}
            </span>
          </h3>
          <div className="flex items-center gap-1">
            <button className="flex h-6 w-5 items-center justify-center dark:text-neutral-500">
              <EllipsisVertical size={26} />
            </button>
            <button
              className="flex h-6 w-6 items-center justify-center rounded bg-gray-200 dark:bg-dark-tertiary dark:text-white"
              onClick={() => setIsModalNewTaskOpen(true)}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
      {tasks
        .filter((task) => task.status === status)
        .map((task) => (
          <Task key={task.id} task={task} handleEdit={handleEdit} />
        ))}
    </div>
  );
};

type TaskProps = {
  task: TaskType;
  handleEdit: (taskId: number) => void;
};

const Task = ({ task, handleEdit }: TaskProps) => {
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "task",
    item: { id: task.id },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  const [deleteTask] = useDeleteTaskMutation();

  const taskTagsSplit = task.tags ? task.tags.split(",") : [];
  const numberOfComments = (task.comments && task.comments.length) || 0;

  const openCommentsModal = (event: MouseEvent<HTMLButtonElement>) => {
    if (task.comments && task.comments.length > 0) {
      setAnchorEl(anchorEl ? null : event.currentTarget);
      setIsCommentsModalOpen(true);
    }
  };

  const closeCommentsPopover = () => {
    setIsCommentsModalOpen(false);
    setAnchorEl(null);
  };

  const PriorityTag = ({ priority }: { priority: TaskType["priority"] }) => {
    return (
      <div
        className={`rounded-full px-2 py-1 text-xs font-semibold ${priority === "Urgent" ? "bg-red-200 text-red-700" : priority === "High" ? "bg-yellow-200 text-yellow-700" : priority === "Medium" ? "bg-blue-200 text-blue-700" : priority === "Low" ? "bg-green-200 text-green-700" : "bg-gray-200 text-gray-700"}`}
      >
        {priority}
      </div>
    );
  };

  const handleDeleteTask = async (taskId: number) => {
    await deleteTask(taskId);
  };

  const handleToggle = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const CommentsModal = () => {
    return (
      <Popover
        open={isCommentsModalOpen}
        anchorEl={anchorEl}
        onClose={closeCommentsPopover}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "12px",
              boxShadow: "0 0 20px rgba(0, 0, 0, 0.15)",
            },
          },
        }}
      >
        <div className="flex items-center justify-center">
          <div className="relative w-96 rounded-lg bg-white p-6 shadow-lg">
            <button
              onClick={closeCommentsPopover}
              className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </button>

            <h2 className="mb-4 text-xl font-semibold">Comments</h2>

            <ul className="list-inside list-disc text-gray-700">
              {task.comments?.length &&
                task.comments?.map((comment) => (
                  <li key={comment.id} className="mb-2 text-gray-700">
                    {comment.text}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </Popover>
    );
  };

  return (
    <div
      ref={(instance) => {
        drag(instance);
      }}
      className={`rounded-mg mb-4 bg-white shadow dark:bg-dark-secondary ${isDragging ? "opacity-50" : "opacity-100"}`}
    >
      {task.attachments && task.attachments.length > 0 && (
        <Image
          src={`https://pm-s3-all-images.s3.us-east-1.amazonaws.com/${task.attachments[0].fileURL}`}
          alt={task.attachments[0].fileName}
          width={400}
          height={200}
          className="h-auto w-full rounded-t-md"
          priority
        />
      )}
      <div className="p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {task.priority && <PriorityTag priority={task.priority} />}
            <div className="flex gap-2">
              {taskTagsSplit.map((tag) => (
                <div
                  key={tag}
                  className="rounded-full bg-blue-100 px-2 py-1 text-xs"
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>

          <button
            className="flex flex-shrink items-center justify-center dark:text-neutral-500"
            onClick={handleToggle}
          >
            <Ellipsis size={16} />
          </button>
          <ActionPopper
            anchorEl={anchorEl}
            id={task.id}
            onDelete={() => handleDeleteTask(task.id)}
            onClose={() => setAnchorEl(null)}
            onEdit={() => handleEdit(task.id)}
          />
        </div>
        <div className="my-3 flex justify-between">
          <h4 className="tetx-md font-bold dark:text-white">{task.title}</h4>
          {typeof task.points === "number" && (
            <div className="text-xs font-semibold dark:text-white">
              {task.points} pts
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 dark:text-neutral-500">
          {formatDate(task.startDate || "") && (
            <span>{formatDate(task.startDate || "")} - </span>
          )}
          {formatDate(task.dueDate || "") && (
            <span>{formatDate(task.dueDate || "")}</span>
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-neutral-500">
          {task.description}{" "}
        </p>
        <div className="drak:border-stroke-dark mt-4 border-t border-gray-200" />

        {/* Users */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex -space-x-[6px] overflow-hidden">
            {task.assignee && (
              <Image
                key={task.assignee.userId}
                src={`https://pm-s3-all-images.s3.us-east-1.amazonaws.com/${task.assignee.profilePictureUrl!}`}
                alt={task.assignee.username}
                width={30}
                height={30}
                className="h-8 w-8 rounded-full border-white object-cover dark:border-dark-secondary"
                priority
              />
            )}
            {task.author && (
              <Image
                key={task.author.userId}
                src={`https://pm-s3-all-images.s3.us-east-1.amazonaws.com/${task.author.profilePictureUrl!}`}
                alt={task.author.username}
                width={30}
                height={30}
                className="h-8 w-8 rounded-full border-white object-cover dark:border-dark-secondary"
                priority
              />
            )}
          </div>
          <div className="flex items-center text-gray-500 dark:text-neutral-500">
            <button
              className={`flex h-6 w-6 items-center justify-center rounded ${task.comments && task.comments?.length > 0 ? "dark:text-white" : "cursor-not-allowed text-gray-300 dark:text-gray-500"}`}
              onClick={openCommentsModal}
              disabled={task.comments && task.comments.length < 0}
            >
              <MessageSquareMore size={20} />
            </button>
            <span className="ml-1 text-sm dark:text-neutral-400">
              {numberOfComments}
            </span>
          </div>
          <CommentsModal />
        </div>
      </div>
    </div>
  );
};

export default Board;
