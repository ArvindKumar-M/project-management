import React from "react";

type Props = {
  message?: string;
};

const InfoAlert = ({ message }: Props) => {
  return (
    <div className="w-1/2 space-y-2 p-8">
      <div
        role="alert"
        className="p- flex transform items-center rounded-lg border-l-4 border-blue-500 bg-blue-100 p-4 text-blue-900 transition duration-300 ease-in-out hover:scale-105 hover:bg-blue-200 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800"
      >
        <svg
          stroke="currentColor"
          viewBox="0 0 24 24"
          fill="none"
          className="mr-2 h-6 w-6 flex-shrink-0 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          ></path>
        </svg>
        <p className="text-md font-bold">{message}</p>
      </div>
    </div>
  );
};

export default InfoAlert;
