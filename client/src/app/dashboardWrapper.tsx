"use client";

import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import StoreProvider, { useAppSelector } from "./redux";
import { useGetProjectsQuery } from "@/state/api";
import Loading from "@/components/Loading";
import AuthProvider from "./authProvider";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );
  const { isLoading } = useGetProjectsQuery();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  });

  return (
    <div className="flex min-h-screen w-full bg-gray-50 text-gray-900">
      <Sidebar />
      <main
        className={`flex w-full flex-col dark:bg-dark-bg ${isSidebarCollapsed ? "" : "md:pl-64"}`}
      >
        <Navbar />
        {children}
        {isLoading && <Loading />}
      </main>
    </div>
  );
};

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <AuthProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </AuthProvider>
    </StoreProvider>
  );
};
export default DashboardWrapper;
