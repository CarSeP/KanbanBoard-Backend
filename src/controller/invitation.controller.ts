import { Request, Response } from "express";
import {
  acceptInvitation,
  createInvitationLink,
  inviteUserToBoard,
} from "@services/invitation.service";
import {
  validateInviteLink,
  validateInviteUser,
} from "@schemas/invitation.schema";

const createLink = async (req: Request, res: Response) => {
  try {
    const boardId = req.params.boardId;
    const body = req.body;
    const validate = validateInviteLink(body);

    if (!validate.validate) {
      return res.status(400).json({
        success: false,
        message: validate.errors,
      });
    }

    const result = await createInvitationLink(
      boardId,
      body.role,
      req.user.id,
      body.expiresIn,
    );

    if (!result.success) {
      const status = result.error === "permission" ? 403 : 500;
      const message =
        result.error === "permission"
          ? ["You don't have permission to invite with this role"]
          : ["Server error"];

      return res.status(status).json({ success: false, message });
    }

    return res.status(200).json({ success: true, invitation: result.invitation });
  } catch {
    return res.status(500).json({
      success: false,
      message: ["Server error"],
    });
  }
};

const inviteUser = async (req: Request, res: Response) => {
  try {
    const boardId = req.params.boardId;
    const body = req.body;
    const validate = validateInviteUser(body);

    if (!validate.validate) {
      return res.status(400).json({
        success: false,
        message: validate.errors,
      });
    }

    const result = await inviteUserToBoard(
      boardId,
      body.userId,
      body.role,
      req.user.id,
    );

    if (!result.success) {
      const errorMap: Record<string, [number, string]> = {
        permission: [403, "You don't have permission to assign this role"],
        user_not_found: [404, "User not found"],
        already_member: [409, "User is already a member of this board"],
      };

      const [status, message] = errorMap[result.error!] || [500, "Server error"];

      return res.status(status).json({ success: false, message: [message] });
    }

    return res.status(200).json({ success: true, boardMember: result.boardMember });
  } catch {
    return res.status(500).json({
      success: false,
      message: ["Server error"],
    });
  }
};

const accept = async (req: Request, res: Response) => {
  try {
    const token = req.params.token;
    const result = await acceptInvitation(token, req.user.id);

    if (!result.success) {
      const errorMap: Record<string, [number, string]> = {
        invitation_not_found: [404, "Invitation not found"],
        invitation_expired: [410, "Invitation has expired"],
        already_member: [409, "You are already a member of this board"],
      };

      const [status, message] = errorMap[result.error!] || [500, "Server error"];

      return res.status(status).json({ success: false, message: [message] });
    }

    return res.status(200).json({ success: true, boardMember: result.boardMember });
  } catch {
    return res.status(500).json({
      success: false,
      message: ["Server error"],
    });
  }
};

export const invitationController = {
  createLink,
  inviteUser,
  accept,
};
