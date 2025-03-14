import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving users: ${error.message}` });
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  const { cognitoId } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { cognitoId },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving users: ${error.message}` });
  }
};

export const postUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, cognitoId, email, profilePictureUrl, teamId } = req.body;

    // Check if required fields exist
    if (!username || !cognitoId) {
      res.status(400).json({
        message: "Username and cognitoId are required",
      });
      return;
    }

    // Check if user with this cognitoId already exists
    const existingUser = await prisma.user.findUnique({
      where: { cognitoId },
    });

    if (existingUser) {
      res.status(409).json({
        message: "User with this cognitoId already exists",
        user: existingUser,
      });
      return;
    }

    // Create user with provided data or defaults
    const newUser = await prisma.user.create({
      data: {
        username,
        cognitoId,
        email,
        profilePictureUrl: profilePictureUrl || "i1.jpg",
        teamId: teamId || null,
      },
    });

    res
      .status(201)
      .json({ message: "User Created Successfully", user: newUser });
  } catch (error: any) {
    // Handle unique constraint violations separately
    if (error.code === "P2002") {
      res.status(409).json({
        message: `User with this ${
          error.meta?.target?.[0] || "attribute"
        } already exists`,
      });
      return;
    }

    res.status(500).json({ message: `Error creating user: ${error.message}` });
  }
};
