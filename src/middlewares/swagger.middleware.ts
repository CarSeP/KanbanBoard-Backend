import { Request, Response, NextFunction } from "express";
import { readFile } from "fs/promises";

export async function swaggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (process.env.NODE_ENV === "production") {
      return res.status(404).json({
        success: false,
        message: ["Not found"],
      });
    }

    await readFile(new URL("../../swagger.json", import.meta.url));

    next();
  } catch {
    return res.status(500).json({
      success: false,
      message: ["swagger.json file not found"],
    });
  }
}
