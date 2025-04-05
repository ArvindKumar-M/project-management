"use client";

import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { capitalizeFirstLetter } from "@/lib/utils";
import { useGetAuthUserQuery, useUpdateUserMutation } from "@/state/api";
import Image from "next/image";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import "@aws-amplify/ui-react/styles.css";
import { getSignedURL } from "@/lib/actions";
import { CloudUpload } from "lucide-react";

const Profile = () => {
  const { data: currentUser, isLoading } = useGetAuthUserQuery({});
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [userDetails, setUserDetails] = useState({
    username: "",
    profilePictureUrl: "",
    isUserLoading: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setpreViewImage] = useState<string | undefined>(
    undefined,
  );
  const [file, setFile] = useState<File | undefined>(undefined);
  const [fileUrl, setFileUrl] = useState<string | undefined>(undefined);

  const computeSHA256 = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserDetails((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const imageFile = e.target.files?.[0];
    setFile(imageFile);

    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }

    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setpreViewImage(url);
    } else {
      setFileUrl(undefined);
      setpreViewImage(undefined);
    }
  };

  const triggerFileInput = () => {
    console.log("cliced");
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    try {
      if (file && currentUser?.userDetails.userId) {
        const checksum = await computeSHA256(file);
        const signedURLResult = await getSignedURL(
          file.type,
          file.size,
          checksum,
          currentUser?.userDetails.userId,
        );

        if (signedURLResult.failure !== undefined) {
          toast.error("Failed to get signed URL");
          console.error("Failed to get signed URL:", signedURLResult.failure);
          return;
        }
        const { url, key } = signedURLResult.success;

        await fetch(url, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        await updateUser({
          userId: currentUser?.userDetails.userId,
          data: {
            username: userDetails.username,
            profilePictureUrl: key,
          },
        });
      }

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    }
  };

  const inputStyles =
    "mt-1 w-full rounded-md border border-gray-300 p-3 text-sm outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white";

  useEffect(() => {
    if (currentUser?.userDetails) {
      const { username, profilePictureUrl } = currentUser.userDetails;
      setUserDetails({
        username: username || "",
        profilePictureUrl: profilePictureUrl || "",
        isUserLoading: true,
      });
    }
  }, [currentUser]);

  if (isLoading || !userDetails.isUserLoading) return <Loading />;

  return (
    <div className="min-h-[500px] w-full max-w-5xl rounded-lg bg-white p-10 dark:bg-dark-secondary">
      <Header name="Profile" />
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-start">
        <Image
          key={currentUser?.userDetails?.userId}
          src={
            previewImage ||
            (userDetails.profilePictureUrl
              ? `https://pm-s3-all-images.s3.us-east-1.amazonaws.com/${userDetails?.profilePictureUrl}`
              : "/avatar.png")
          }
          alt={userDetails.username ?? "Profile picture"}
          width={120}
          height={120}
          className="h-32 w-32 rounded-lg border border-gray-200 object-cover dark:border-dark-secondary"
          priority
        />

        <div
          className="max flex h-32 w-full max-w-[448px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-900 dark:hover:border-gray-400"
          onClick={triggerFileInput}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
          />
          <button type="button" className="flex flex-col items-center gap-4">
            <CloudUpload
              size={20}
              className="text-gray-500 dark:text-gray-400"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Click to upload
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              PNG, JPG or JPEG (Max. 10MB)
            </span>
          </button>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="w-full sm:w-[280px]">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              type="text"
              className={`focus:border-none focus:outline-blue-600 ${inputStyles}`}
              name="username"
              value={capitalizeFirstLetter(userDetails.username ?? "")}
              onChange={handleChange}
            />
          </div>
          <div className="w-full sm:w-[280px]">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              className={inputStyles}
              name="email"
              value={currentUser?.userDetails.email ?? ""}
              readOnly
            />
          </div>
        </div>

        {/* Row: Team Name */}
        <div className="w-full sm:w-[580px]">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Team Name
          </label>
          <input
            type="text"
            className={inputStyles}
            value={capitalizeFirstLetter(
              currentUser?.userDetails.team?.teamName || "No Team",
            )}
            readOnly
          />
        </div>
        <div>
          <button
            onClick={handleSubmit}
            disabled={isUpdating}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {isUpdating ? "Uploading..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
