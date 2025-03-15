import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  fetchAuthSession,
  fetchUserAttributes,
  getCurrentUser,
} from "aws-amplify/auth";

export interface Project {
  id: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export enum Status {
  ToDo = "To Do",
  WorkInProgress = "Work In Progress",
  UnderReview = "Under Review",
  Completed = "Completed",
}

export enum Priority {
  Urgent = "Urgent",
  High = "High",
  Medium = "Medium",
  Low = "Low",
  Backlog = "Backlog",
}

export interface User {
  userId?: number;
  username: string;
  email?: string | null;
  profilePictureUrl?: string;
  cognitoId?: string | null;
  teamId?: number | null;
}

export interface Attachment {
  id: number;
  fileURL: string;
  fileName: string;
  taskId: number;
  uploadedById: number;
}

export interface Comment {
  id: number;
  text: string;
  taskId: number;
  userId: number;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  tags?: string;
  startDate?: string;
  dueDate?: string;
  points?: string;
  projectId: number;
  authorUserId?: string;
  assignedUserId?: number;

  author?: User;
  assignee?: User;
  comments?: Comment[];
  attachments?: Attachment[];
}

export interface SearchResults {
  tasks?: Task[];
  projects?: Project[];
  users?: User[];
}

export interface Team {
  teamId: number;
  teamName: string;
  productOwnerUserId?: number;
  projectManagerUserId?: number;
}

export interface SearchResults {
  tasks?: Task[];
  projects?: Project[];
  users?: User[];
}

export interface Teams {
  teamId: number;
  teamName: string;
  productOwnerUserId?: number;
  projectManagerUserId?: number;
}
export interface EditTask {
  title: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  tags?: string;
  startDate?: string;
  dueDate?: string;
  points?: string;
  assignedUserId?: number;
}
type CreateUserResponse = {
  responseData?: {
    message: string;
    user: User;
  };
  user?: User;
  newUser?: User;
};

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers) => {
      const session = await fetchAuthSession();
      const { accessToken } = session.tokens ?? {};
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }
      return headers;
    },
  }),
  reducerPath: "api",
  tagTypes: ["Projects", "Tasks", "Users", "Teams", "AuthUser"],
  endpoints: (build) => ({
    getAuthUser: build.query({
      queryFn: async (_, queryApi, extraOptions, fetchWithBQ) => {
        try {
          // Get current AWS Amplify session
          const session = await fetchAuthSession();
          if (!session) throw new Error("No session found");

          const { userSub } = session;

          let attributes;
          try {
            // Get user attributes including email from Cognito
            attributes = await fetchUserAttributes();
          } catch (error) {
            if (error instanceof Error && "name" in error) {
              if (error.name === "UserNotFoundException") {
                console.warn("User not found in Cognito. Logging out...");
                return {
                  error: {
                    status: 401,
                    data: "User not found. Please re-authenticate.",
                    logout: true, // <-- Pass logout flag
                  },
                };
              }
              if (error.name === "NotAuthorizedException") {
                console.warn("Access Token revoked, clearing user session.");
                queryApi.dispatch(api.util.invalidateTags(["AuthUser"]));
                return {
                  error: {
                    status: 401,
                    data: "Session expired. Please log in again.",
                    logout: true, // <-- Pass logout flag
                  },
                };
              }
            }
            throw error;
          }
          const email = attributes.email;

          const user = await getCurrentUser();

          // Try to get existing user
          let userDetailsResponse;
          try {
            userDetailsResponse = await fetchWithBQ({
              url: `users/${userSub}`,
              method: "GET",
              params: { _t: Date.now() }, // Cache busting
            });
          } catch (error) {
            userDetailsResponse = { error };
          }

          // If user doesn't exist in your database yet (first login)
          if (userDetailsResponse.error || !userDetailsResponse.data) {
            // Create new user with Cognito ID
            const createUserResponse = await fetchWithBQ({
              url: "users",
              method: "POST",
              body: {
                username: user.username,
                cognitoId: userSub,
                email: email,
              },
            });

            // Get the user data from response
            const responseData = createUserResponse.data as CreateUserResponse;
            const newUserDetails =
              responseData?.responseData?.user ||
              responseData?.user ||
              responseData?.newUser;

            if (!newUserDetails) {
              throw new Error("Invalid response format from user creation");
            }

            // Important: Invalidate both Users and AuthUser tags
            queryApi.dispatch(api.util.invalidateTags(["Users", "AuthUser"]));
            return {
              data: {
                user,
                userSub,
                userDetails: newUserDetails,
              },
            };
          }

          const userDetails = userDetailsResponse.data as User;
          return { data: { user, userSub, userDetails } };
        } catch (error) {
          console.error("Auth user fetch error:", error);
          return { error: { status: 500, data: error } };
        }
      },
      providesTags: ["AuthUser"],
    }),
    getProjects: build.query<Project[], void>({
      query: () => "projects",
      providesTags: ["Projects"],
    }),
    createProject: build.mutation<Project, Partial<Project>>({
      query: (project) => ({
        url: "projects",
        method: "POST",
        body: project,
      }),
      invalidatesTags: ["Projects"],
    }),
    getTasks: build.query<Task[], { projectId: number }>({
      query: ({ projectId }) => `tasks?projectId=${projectId}`,
      providesTags: (result, error, arg) => [
        ...(result
          ? result.map(({ id }) => ({ type: "Tasks" as const, id }))
          : []),
        { type: "Tasks", id: arg.projectId },
      ],
    }),
    getTasksByUser: build.query<Task[], number>({
      query: (userId) => `tasks/user/${userId}`,
      providesTags: (result, error, userId) =>
        result
          ? result.map(({ id }) => ({ type: "Tasks", id }))
          : [{ type: "Tasks", id: userId }],
    }),
    createTask: build.mutation<Task, Partial<Task>>({
      query: (task) => ({
        url: "tasks",
        method: "POST",
        body: task,
      }),
      invalidatesTags: (result, error, task) => [
        { type: "Tasks", id: task.projectId },
        "Tasks",
      ],
    }),
    updateTaskStatus: build.mutation<Task, { taskId: number; status: string }>({
      query: ({ taskId, status }) => ({
        url: `tasks/${taskId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Tasks", id: taskId },
      ],
    }),
    deleteTask: build.mutation<Task, number>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Tasks", id }],
    }),
    editTask: build.mutation<Task, { id: number; task: EditTask }>({
      query: ({ id, task }) => ({
        url: `/tasks/${id}`,
        method: "PUT",
        body: task,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Tasks", id: id }],
    }),
    getUsers: build.query<User[], void>({
      query: () => "users",
      providesTags: ["Users"],
    }),
    getTeams: build.query<Team[], void>({
      query: () => "teams",
      providesTags: ["Teams"],
    }),
    search: build.query<SearchResults, string>({
      query: (query) => `search?query=${query}`,
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskStatusMutation,
  useSearchQuery,
  useGetUsersQuery,
  useGetTeamsQuery,
  useGetTasksByUserQuery,
  useGetAuthUserQuery,
  useDeleteTaskMutation,
  useEditTaskMutation,
} = api;
