"use client";

import { CircleAlert, X } from "lucide-react";
import { useState } from "react";

type ErrorProps = {
  error?: string;
};

const ErrorAlert = ({ error }: ErrorProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(true);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="sm:w-92 sm:text-md w-100 z-50 flex flex-col gap-2 font-semibold">
        <div className="error-alert flex h-12 w-full cursor-default items-center justify-between rounded-lg bg-[#232531] px-3 py-8 sm:h-14">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-white/5 p-1 text-[#d65563] backdrop-blur-xl">
              <CircleAlert className="h-6 w-6" />
            </div>
            <div>
              <p className="text-white">Please try again</p>
              <p className="text-gray-500">{error}</p>
            </div>
            <button
              className="rounded-md p-1 text-gray-600 transition-colors ease-linear hover:bg-white/10"
              onClick={() => setIsVisible(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorAlert;
