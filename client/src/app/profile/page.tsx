"use client";

import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { capitalizeFirstLetter } from "@/lib/utils";
import {
  useGetAuthUserQuery,
  useRemoveProfilePictureMutation,
  useUpdateUserMutation,
} from "@/state/api";
import Image from "next/image";
import React, { ChangeEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import "@aws-amplify/ui-react/styles.css";
import { getSignedURL } from "@/lib/actions";
import { Camera, X } from "lucide-react";
import ConfirmationModal from "@/components/ConfirmationModal";

const Profile = () => {
  const { data: currentUser, isLoading } = useGetAuthUserQuery({});
  const [removeProfilePicture] = useRemoveProfilePictureMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [userDetails, setUserDetails] = useState({
    username: "",
    profilePictureUrl: "",
    isUserLoading: false,
  });
  const [previewImage, setpreViewImage] = useState<string | undefined>(
    undefined,
  );
  const [file, setFile] = useState<File | undefined>(undefined);
  const [fileUrl, setFileUrl] = useState<string | undefined>(undefined);
  const [addedToServer, setAddedToServer] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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

        const response = await fetch(url, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (!response.ok) {
          throw new Error(`S3 upload failed with status: ${response.status}`);
        }

        await updateUser({
          userId: currentUser?.userDetails.userId,
          data: {
            username: userDetails.username,
            profilePictureUrl: key,
          },
        });
      }
      toast.success("Profile updated successfully");
      setAddedToServer(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      if (previewImage && !addedToServer) {
        //remove preview without confirmation
        setFile(undefined);
        setpreViewImage(undefined);
        return;
      }

      //for images already on the server, show confirmation modal
      if (
        currentUser?.userDetails.userId &&
        currentUser.userDetails.profilePictureUrl
      ) {
        setShowConfirmModal(true);
        return;
      }

      toast.info("No profile picture to remove");
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove picture");
    }
  };

  const confirmRemoveProfilePicture = async () => {
    try {
      if (
        !currentUser?.userDetails.userId ||
        !currentUser?.userDetails.profilePictureUrl
      ) {
        return;
      }

      await removeProfilePicture({
        userId: currentUser.userDetails.userId,
        profilePictureKey: currentUser.userDetails.profilePictureUrl,
      }).unwrap();

      setFile(undefined);
      setpreViewImage(undefined);
      setAddedToServer(false);
      setShowConfirmModal(false);
      toast.success("Profile picture removed successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove profile picture");
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
      <div className="mt-10 flex flex-col gap-10">
        <div className="flex flex-col gap-4 sm:flex-col">
          <div className="relative h-52 w-52 rounded-lg bg-gray-100">
            <Image
              key={currentUser?.userDetails?.userId}
              src={
                previewImage ||
                (userDetails.profilePictureUrl
                  ? `https://pm-s3-all-images.s3.us-east-1.amazonaws.com/${userDetails?.profilePictureUrl}`
                  : "https://pm-s3-all-images.s3.us-east-1.amazonaws.com/avatar.png")
              }
              alt={userDetails.username ?? "Profile picture"}
              width={200}
              height={200}
              className="h-full w-full rounded-lg border border-gray-200 object-cover dark:border-dark-secondary"
              priority
            />
            <button
              type="button"
              className="absolute right-2 top-2 rounded-full bg-gray-200 p-1 shadow transition hover:bg-gray-300"
              onClick={handleRemoveProfilePicture}
              disabled={
                !previewImage && !currentUser?.userDetails.profilePictureUrl
              }
            >
              <X size={14} className="text-gray-600 hover:text-black" />
            </button>

            <ConfirmationModal
              isOpen={showConfirmModal}
              title="Remove Profile Picture"
              message="Are you Sure you want to remove your profile picture? This action cannot be undone."
              confirmBtnText="Remove"
              cancelBtnText="Cancel"
              onConfirm={confirmRemoveProfilePicture}
              onCancel={() => setShowConfirmModal(false)}
            />
          </div>
          <div className="w-52 rounded-md border bg-slate-100 p-2 dark:border-gray-600 dark:bg-slate-800">
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                id="fileUpload"
              />
              <label
                htmlFor="fileUpload"
                className="flex w-full cursor-pointer items-center gap-3 rounded-md border border-gray-200 bg-white px-4 py-2 text-center text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:border-gray-500 dark:hover:bg-gray-800"
              >
                <Camera size={16} />
                <span className="inline-block">Add profile picture</span>
              </label>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6">
            <div className="w-full sm:w-[480px]">
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
            <div className="w-full sm:w-[480px]">
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
          <div className="w-full sm:w-[480px]">
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
    </div>
  );
};

export default Profile;
