import { User } from "@interfaces/user.interface";
import { validateToken } from "@services/auth.service";
import { NextFunction, Request, Response } from "express";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split("Bearer ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: ["No authentication token provided"],
    });
  }

  const [isValid, user] = await validateToken(token);

  if (!isValid || !user) {
    return res.status(401).json({
      success: false,
      message: ["Invalid or expired token"],
    });
  }

  req.user = user;
  next();
};

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}
