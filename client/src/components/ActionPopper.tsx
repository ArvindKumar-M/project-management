import React, { useState, MouseEvent, useRef } from "react";
import {
  Popper,
  Paper,
  IconButton,
  ClickAwayListener,
  MenuItem,
  MenuList,
  DialogContent,
  Modal,
} from "@mui/material";
import { Pencil, Trash } from "lucide-react";

type Props = {
  id: number;
  onDelete: (id: number) => void;
  onClose: () => void;
  anchorEl: HTMLElement | null;
  onEdit: (taskId: number) => void;
};

const ActionPopper = ({ id, onDelete, anchorEl, onClose, onEdit }: Props) => {
  return (
    <Popper
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      placement="bottom-start"
      modifiers={[{ name: "offset", options: { offset: [0, 8] } }]}
    >
      <ClickAwayListener onClickAway={onClose}>
        <Paper className="rounded-sm border bg-white shadow-md dark:border-gray-700 dark:bg-dark-secondary dark:shadow-lg">
          <MenuList>
            <MenuItem
              sx={{ color: "#4b5563" }}
              className="dark:text-neutral-500 dark:hover:text-gray-300"
              onClick={() => {
                onEdit(id);
                onClose();
              }}
            >
              <Pencil
                size={14}
                className="mr-2 text-gray-600 dark:text-gray-300"
              />
              Edit
            </MenuItem>
            <MenuItem
              onClick={() => {
                onDelete(id);
                onClose();
              }}
              sx={{ color: "#4b5563" }}
              className="dark:text-neutral-500 dark:hover:text-gray-300"
            >
              <Trash
                size={14}
                className="mr-2 text-xs text-gray-600 dark:text-gray-300"
              />
              Delete
            </MenuItem>
          </MenuList>
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
};

export default ActionPopper;
