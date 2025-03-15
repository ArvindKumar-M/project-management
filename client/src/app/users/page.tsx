"use client";

import { useGetAuthUserQuery, useGetUsersQuery } from "@/state/api";
import React, { useEffect } from "react";
import { useAppSelector } from "../redux";
import Loading from "@/components/Loading";
import ErrorAlert from "@/components/ErrorAlert";
import Header from "@/components/Header";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import Image from "next/image";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";

const CustomToolbar = () => (
  <GridToolbarContainer className="toolbar flex gap-2">
    <GridToolbarFilterButton />
    <GridToolbarExport />
  </GridToolbarContainer>
);

const columns: GridColDef[] = [
  { field: "userId", headerName: "ID", width: 100 },
  { field: "username", headerName: "User Name", width: 150 },
  {
    field: "profilePictureUrl",
    headerName: "Profile Picture",
    width: 100,
    renderCell: (params) => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-9 w-9">
          <Image
            src={`https://pm-s3-all-images.s3.us-east-1.amazonaws.com/${params.value}`}
            alt={params.row.username}
            width={100}
            height={50}
            className="h-full rounded-full object-cover"
          />
        </div>
      </div>
    ),
  },
];

const Users = () => {
  const { data: users, isLoading, isError, refetch } = useGetUsersQuery();
  const { data: authData } = useGetAuthUserQuery({});
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  useEffect(() => {
    if (authData?.userDetails) {
      refetch();
    }
  }, [authData, refetch]);

  if (isLoading) return <Loading />;
  if (isError && !users) return <ErrorAlert error="Error fetching users" />;

  return (
    <div className="flex w-full flex-col p-8">
      <Header name="Users" />
      <div style={{ height: 650, width: "100%" }}>
        <DataGrid
          getRowId={(row) => row.userId}
          rows={users || []}
          columns={columns}
          slots={{
            toolbar: CustomToolbar,
          }}
          pagination
          className={dataGridClassNames}
          sx={dataGridSxStyles(isDarkMode)}
        />
      </div>
    </div>
  );
};

export default Users;
