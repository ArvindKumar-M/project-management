import React, { ReactNode } from "react";
import {
  Authenticator,
  ThemeProvider,
  Theme,
  useTheme,
} from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import { Box, Typography } from "@mui/material";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_CONGNITO_USER_POOL_ID || "",
      userPoolClientId:
        process.env.NEXT_PUBLIC_CONGNITO_USER_POOL_CLIENT_ID || "",
    },
  },
  Storage: {
    S3: {
      bucket: process.env.NEXT_PUBLIC_BUCKET_NAME,
      region: process.env.NEXT_PUBLIC_BUCKET_REGION,
    },
  },
});

const formFields = {
  signIn: {
    username: {
      label: "Email",
      placeholder: "Enter your email",
    },
  },
  signUp: {
    username: {
      order: 1,
      placeholder: "Choose a username",
      label: "Username",
      inputprops: { required: true },
    },
    email: {
      order: 1,
      placeholder: "Enter your email address",
      label: "Email",
      inputprops: { type: "email", required: true },
    },
    password: {
      order: 3,
      placeholder: "Enter your password",
      label: "Password",
      inputprops: { type: "password", required: true },
    },
    confirm_password: {
      order: 4,
      placeholder: "Confirm your password",
      label: "Confirm Password",
      inputprops: { type: "password", required: true },
    },
  },
};

type Props = {
  children: ReactNode;
};

const AuthProvider = ({ children }: Props) => {
  const { tokens } = useTheme();

  const theme: Theme = {
    name: "Styled Auth Theme",
    tokens: {
      components: {
        authenticator: {
          router: {
            backgroundColor: "#ffffff",
            boxShadow: `0 4px 24px ${tokens.colors.overlay["20"]}`,
            borderWidth: "0",
          },
          form: {
            padding: `${tokens.space.large} ${tokens.space.xl}`,
          },
        },
        button: {
          borderRadius:"0.5rem",
          primary: {
           
            backgroundColor: tokens.colors.blue["60"],
            color: tokens.colors.white,
            _hover: {
              backgroundColor: tokens.colors.blue["80"],
            },
          },
          link: {
            color: tokens.colors.blue["80"],
          },
        },
        fieldcontrol: {
          borderRadius:"0.5rem",
          _focus: {
            boxShadow: `0 0 0 2px ${tokens.colors.blue["60"]}`,
            borderColor:"transparent"
          },
        },
        tabs: {
          item: {
            color: tokens.colors.neutral["80"],
            _active: {
              borderColor: tokens.colors.blue["100"],
              color: tokens.colors.blue["100"],
            },
          },
        },
      },
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <Authenticator
        formFields={formFields}
        variation="modal"
        components={{
          Header: () => (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "linear-gradient(90deg, #2563eb, #1e3a8a)",
                color: "#fff",
                py: 2,
                borderRadius: "1rem 1rem 0 0",
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: "600", fontFamily: "Poppins" }}>
                Project Management
              </Typography>
            </Box>
          ),
          Footer: () => (
            <Box
              sx={{
                background: "#f5f5f5",
                borderRadius: "0 0 1rem 1rem",
                py: 1,
                textAlign: "center",
                fontSize: "0.85rem",
                color: "#666",
              }}
            >
              &copy; {new Date().getFullYear()} AKM
            </Box>
          ),
        }}
      >
        {({ user }) =>
          user ? (
            <div>{children}</div>
          ) : (
            <div>
              <h1>Please Sign in below:</h1>
            </div>
          )
        }
      </Authenticator>
    </ThemeProvider>
  );
};

export default AuthProvider;
