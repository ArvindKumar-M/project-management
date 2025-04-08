import React from "react";
import {
  Popper,
  Paper,
  ClickAwayListener,
  MenuItem,
  MenuList,
  Box,
} from "@mui/material";
import { CircleUserRound, LogOut, X } from "lucide-react";
import { signOut } from "aws-amplify/auth";
import Image from "next/image";
import Link from "next/link";
import { capitalizeFirstLetter } from "@/lib/utils";

type Props = {
  onClose: () => void;
  anchorEl: HTMLElement | null;
  profile?: string;
  username: string;
};

const ProfilePopper = ({ anchorEl, onClose, profile, username }: Props) => {
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };
  return (
    <Popper
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      placement="bottom-start"
      modifiers={[{ name: "offset", options: { offset: [0, 8] } }]}
    >
      <ClickAwayListener onClickAway={onClose}>
        <Paper className="h-74 relative w-64 rounded-lg border bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-dark-secondary dark:shadow-lg">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 cursor-pointer text-gray-700 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={16} />
          </button>
          <Box className="flex flex-col items-center pb-3 dark:border-gray-600">
            <Image
              src={
                profile
                  ? `https://pm-s3-all-images.s3.us-east-1.amazonaws.com/${profile}`
                  : "https://pm-s3-all-images.s3.us-east-1.amazonaws.com/avatar.png"
              }
              alt={username || "User Profile Picture"}
              width={100}
              height={100}
              className="h-24 w-24 rounded-full object-cover"
            />
            <span className="mt-2 text-lg font-semibold text-gray-800 dark:text-white">
              Hi, {capitalizeFirstLetter(username ?? "User")}
            </span>
          </Box>
          <MenuList className="mt-2 space-y-4">
            <MenuItem
              sx={{ color: "#4b5563" }}
              className="flex items-center gap-2 space-x-2 rounded-lg px-5 py-3 text-gray-700 hover:rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              onClick={() => {
                onClose();
              }}
            >
              <CircleUserRound size={20} />
              <Link
                href="/profile"
                className="w-full text-gray-900 dark:text-gray-300"
              >
                Profile
              </Link>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleSignOut();
                onClose();
              }}
              sx={{ color: "#4b5563" }}
              className="flex items-center gap-1 space-x-2 rounded-lg px-5 py-3 text-gray-700 hover:rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <LogOut size={18} />
              <span className="text-gray-900 dark:text-gray-300">Sign out</span>
            </MenuItem>
          </MenuList>
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
};

export default ProfilePopper;
