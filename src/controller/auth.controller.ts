import {
  createUserAsGuest,
  findOrCreateGoogleUser,
  getToken,
  validateToken,
} from "@services/auth.service";
import { getGoogleAuthUrl, getGoogleUserInfo } from "@services/google-auth.service";
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
      message: ["Authentication required"],
    });
  }

  const [isValid, user] = await validateToken(token);

  if (!isValid || !user) {
    return res.status(401).json({
      success: false,
      message: ["Invalid or expired token"],
    });
  }

  const { id, name, email, provider } = user;

  return res.status(200).json({
    success: true,
    user: { id, name, email, provider },
  });
};

const signOut = async (_req: Request, res: Response) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res.status(200).json({ success: true });
};

const signInWithGoogle = async (req: Request, res: Response) => {
  const url = getGoogleAuthUrl();
  return res.redirect(url);
};

const googleCallback = async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code || typeof code !== "string") {
    return res.status(400).json({
      success: false,
      message: ["Authorization code is required"],
    });
  }

  try {
    const { email, name } = await getGoogleUserInfo(code);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: ["Could not retrieve email from Google"],
      });
    }

    const user = await findOrCreateGoogleUser(email, name);
    const token = await getToken(user.id);

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const frontendUrl = process.env.FRONTEND_URL ?? "/";
    return res.redirect(frontendUrl);
  } catch {
    return res.status(500).json({
      success: false,
      message: ["Server error during Google authentication"],
    });
  }
};

export const authController = {
  signInAsGuest,
  validateSession,
  signOut,
  signInWithGoogle,
  googleCallback,
};
