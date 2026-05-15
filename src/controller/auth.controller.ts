import {
  createUserAsGuest,
  getToken,
  validateToken,
} from "@services/auth.service";
import { Request, Response } from "express";

const signInAsGuest = async (req: Request, res: Response) => {
  try {
    const user = await createUserAsGuest();

    if (!user) {
      throw new Error();
    }

    const { id, name, updatedAt } = user;
    const token = await getToken(id);

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      user: { id, name, updatedAt },
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: ["Server error"],
    });
  }
};

const validateSession = async (req: Request, res: Response) => {
  const token = req.cookies?.auth_token;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: ["No authentication cookie provided"],
    });
  }

  const [isValid, user] = await validateToken(token);

  if (!isValid || !user) {
    return res.status(401).json({
      success: false,
      message: ["Invalid or expired token"],
    });
  }

  return res.status(200).json({ success: true });
};

export const authController = {
  signInAsGuest,
  validateSession,
};
