import { formatDate } from "@/lib/utils";
import { Task } from "@/state/api";
import Image from "next/image";
import React from "react";

type Props = {
  task: Task;
};

const TaskCard = ({ task }: Props) => {
  return (
    <div className="mb-6 rounded-lg bg-white p-6 shadow-lg dark:bg-dark-secondary dark:text-white">
      {task.attachments && task.attachments.length > 0 && (
        <div className="mb-6">
          <strong className="mb-2 block text-lg font-semibold text-gray-700 dark:text-gray-200">
            Attachments:
          </strong>
          <div className="flex flex-wrap gap-4">
            {task.attachments && task.attachments.length > 0 && (
              <div className="relative overflow-hidden rounded-md">
                <Image
                  src={`/${task.attachments[0].fileURL}`}
                  alt={task.attachments[0].fileName}
                  width={400}
                  height={200}
                  className="rounded-md object-cover"
                  priority
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 text-sm text-white">
                  {task.attachments[0].fileName}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <strong className="block text-sm font-medium text-gray-500 dark:text-gray-400">
              ID:
            </strong>
            <p className="text-gray-800 dark:text-gray-100">{task.id}</p>
          </div>
          <div>
            <strong className="block text-sm font-medium text-gray-500 dark:text-gray-400">
              Title:
            </strong>
            <p className="text-gray-800 dark:text-gray-100">{task.title}</p>
          </div>
          <div>
            <strong className="block text-sm font-medium text-gray-500 dark:text-gray-400">
              Description:
            </strong>
            <p className="text-gray-700 dark:text-gray-300">
              {task.description || "No description provided"}
            </p>
          </div>
          <div>
            <strong className="block text-sm font-medium text-gray-500 dark:text-gray-400">
              Tags:
            </strong>
            <p className="text-gray-700 dark:text-gray-300">
              {task.tags || "No tags"}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <strong className="block text-sm font-medium text-gray-500 dark:text-gray-400">
              Status:
            </strong>
            <p className="text-gray-800 dark:text-gray-100">{task.status}</p>
          </div>
          <div>
            <strong className="block text-sm font-medium text-gray-500 dark:text-gray-400">
              Priority:
            </strong>
            <p className="text-gray-800 dark:text-gray-100">{task.priority}</p>
          </div>
          <div>
            <strong className="block text-sm font-medium text-gray-500 dark:text-gray-400">
              Start Date:
            </strong>
            <p className="text-gray-700 dark:text-gray-300">
              {formatDate(task.startDate || "")}
            </p>
          </div>
          <div>
            <strong className="block text-sm font-medium text-gray-500 dark:text-gray-400">
              Due Date:
            </strong>
            <p className="text-gray-700 dark:text-gray-300">
              {formatDate(task.dueDate || "")}
            </p>
          </div>
          <div>
            <strong className="block text-sm font-medium text-gray-500 dark:text-gray-400">
              Author:
            </strong>
            <p className="text-gray-700 dark:text-gray-300">
              {task.author ? task.author.username : "Unknown"}
            </p>
          </div>
          <div>
            <strong className="block text-sm font-medium text-gray-500 dark:text-gray-400">
              Assignee:
            </strong>
            <p className="text-gray-700 dark:text-gray-300">
              {task.assignee ? task.assignee.username : "Unassigned"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
