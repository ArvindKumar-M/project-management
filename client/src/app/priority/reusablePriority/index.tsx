"use client";

import { useAppSelector } from "@/app/redux";
import ErrorAlert from "@/components/ErrorAlert";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import ModalNewTask from "@/components/ModalNewTask";
import TaskCard from "@/components/TaskCard";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import {
  Priority,
  Task,
  useGetAuthUserQuery,
  useGetTasksByUserQuery,
} from "@/state/api";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React, { useState } from "react";
import InfoAlert from "@/components/InfoAlert";

type Props = {
  priority: Priority;
};

const columns: GridColDef[] = [
  {
    field: "title",
    headerName: "Title",
    width: 100,
  },
  {
    field: "description",
    headerName: "Description",
    width: 200,
  },
  {
    field: "status",
    headerName: "Status",
    width: 130,
    renderCell: (params) => (
      <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
        {params.value}
      </span>
    ),
  },
  {
    field: "priority",
    headerName: "Priority",
    width: 75,
  },
  {
    field: "tags",
    headerName: "Tags",
    width: 130,
  },
  {
    field: "startDate",
    headerName: "Start Date",
    width: 130,
  },
  {
    field: "dueDate",
    headerName: "Due Date",
    width: 130,
  },
  {
    field: "author",
    headerName: "Author",
    width: 150,
    renderCell: (params) => params.value?.username || "Unknown",
  },
  {
    field: "assignee",
    headerName: "Assignee",
    width: 150,
    renderCell: (params) => params.value?.username || "Unassigned",
  },
];

const ReusablePriorityPage = ({ priority }: Props) => {
  const [view, setView] = useState("list");
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);

  const { data: currentUser } = useGetAuthUserQuery({});
  const userId = currentUser?.userDetails?.userId ?? null;
  const {
    data: tasks,
    isLoading: isTaskLoading,
    isError: isTasksError,
  } = useGetTasksByUserQuery(userId || 0, { skip: userId === null });

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const filteredTasks = tasks?.filter(
    (task: Task) => task.priority === priority,
  );

  if (isTasksError || !tasks)
    return <ErrorAlert error="Error fetching tasks" />;

  return (
    <div className="m-5 p-4">
      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        onClose={() => setIsModalNewTaskOpen(false)}
      />
      <Header
        name="Priority Page"
        buttonComponent={
          <button
            className="mr-3 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
            onClick={() => setIsModalNewTaskOpen(true)}
          >
            Add Task
          </button>
        }
      />
      <div className="mb-4 flex justify-start gap-2">
        <button
          className={`px-4 py-2 ${view === "list" ? "bg-gray-300" : "bg-white"} rounded-md`}
          onClick={() => setView("list")}
        >
          List
        </button>
        <button
          className={`px-4 py-2 ${view === "table" ? "bg-gray-300" : "bg-white"} rounded-md`}
          onClick={() => setView("table")}
        >
          Table
        </button>
      </div>
      {isTaskLoading ? (
        <Loading />
      ) : view === "list" ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredTasks && filteredTasks?.length > 0 ? (
            filteredTasks?.map((task) => <TaskCard key={task.id} task={task} />)
          ) : (
            <div className="flex items-center justify-center">
              <InfoAlert message="No tasks found with this priority." />
            </div>
          )}
        </div>
      ) : view === "table" && filteredTasks && filteredTasks?.length > 0 ? (
        <div className="z-0 w-full">
          <DataGrid
            rows={filteredTasks}
            columns={columns}
            checkboxSelection
            getRowId={(row) => row.id}
            className={dataGridClassNames}
            sx={dataGridSxStyles(isDarkMode)}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <InfoAlert message="No tasks found with this priority." />
        </div>
      )}
    </div>
  );
};

export default ReusablePriorityPage;
