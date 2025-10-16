import { Router } from "express";

export const notFoundRouter = Router();

notFoundRouter.use("", (req, res) => {
  return res.status(404).json({
    success: false,
    message: [
      `Route ${req.originalUrl} not found or method ${req.method} not implemented on this endpoint.`,
    ],
  });
});
