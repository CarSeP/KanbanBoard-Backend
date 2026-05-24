import { authController } from "@controller/auth.controller";
import { Router } from "express";

export const authRouter = Router();

authRouter.post("/register/guest", authController.signInAsGuest);
authRouter.get("/validate", authController.validateSession);
authRouter.get("/google", authController.signInWithGoogle);
authRouter.get("/google/callback", authController.googleCallback);
