"use client";

import React, { use, useState } from "react";
import ProjectHeader from "@/app/projects/ProjectHeader";
import Board from "../BoardView";
import List from "../ListView";
import Timeline from "../TimelineView";
import Table from "../TableView";
import ModalNewTask from "@/components/ModalNewTask";

type Props = {
  params: Promise<{ id: string }>;
};

const Project = ({ params }: Props) => {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState("Board");
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);

  return (
    <div>
      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        onClose={() => setIsModalNewTaskOpen(false)}
        id={id}
      />
      <ProjectHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setIsModalNewTaskOpen={setIsModalNewTaskOpen}
      />
      {activeTab === "Board" && <Board id={id} />}
      {activeTab === "List" && <List id={id} />}
      {activeTab === "Timeline" && <Timeline id={id} />}
      {activeTab === "Table" && <Table id={id} />}
    </div>
  );
};

export default Project;
