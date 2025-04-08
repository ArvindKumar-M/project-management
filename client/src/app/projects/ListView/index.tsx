import ErrorAlert from "@/components/ErrorAlert";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { Task, useGetTasksQuery } from "@/state/api";
import TaskCard from "@/components/TaskCard";
import InfoAlert from "@/components/InfoAlert";

type ListProps = {
  id: string;
};
const ListView = ({ id }: ListProps) => {
  const {
    data: tasks,
    error,
    isLoading,
  } = useGetTasksQuery({ projectId: Number(id) });

  if (!tasks || tasks.length === 0)
    return (
      <div className="flex h-screen items-center justify-center">
        <InfoAlert message="No tasks in the project" />
      </div>
    );
  if (isLoading) return <Loading />;
  if (error)
    return (
      <ErrorAlert error="An error occurred while fetching project tasks" />
    );

  return (
    <div className="px-4 pb-8 xl:px-6">
      <div className="pt-5">
        <Header name="List" isSmallText />
      </div>
      <div className="md:gridcols-2 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        {tasks?.map((task: Task) => <TaskCard key={task.id} task={task} />)}
      </div>
    </div>
  );
};

export default ListView;
