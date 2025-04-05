import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
  authUser: {
    cognitoId: string;
    userId: string;
    username: string;
    email: string;
  } | null;
};

const initialState: AuthState = {
  authUser: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthUser: (state, action: PayloadAction<AuthState["authUser"]>) => {
      state.authUser = action.payload;
    },
    clearAuthUser: (state) => {
      state.authUser = null;
    },
  },
});

export const { setAuthUser, clearAuthUser } = authSlice.actions;
export default authSlice.reducer;
