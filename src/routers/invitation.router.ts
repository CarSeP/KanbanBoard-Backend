import { invitationController } from "@controller/invitation.controller";
import { Router } from "express";

export const invitationRouter = Router();

invitationRouter.post("/:boardId/invite/link", invitationController.createLink);
invitationRouter.post("/:boardId/invite/user", invitationController.inviteUser);
invitationRouter.post("/invite/accept/:token", invitationController.accept);
