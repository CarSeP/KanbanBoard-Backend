import { Role } from "@interfaces/role.type";
import { prisma } from "@services/prisma.service";
import { generateId } from "./id.service";

const allowedRoles: Record<"OWNER" | "ADMIN", Role[]> = {
  OWNER: ["ADMIN", "EDITOR", "VIEWER"],
  ADMIN: ["EDITOR", "VIEWER"],
};

const getInviterBoardRole = async (inviterId: string, boardId: string) => {
  const member = await prisma.boardMember.findUnique({
    where: {
      userId_boardId: {
        userId: inviterId,
        boardId,
      },
    },
  });

  return (member?.role as Role) || null;
};

export const createInvitationLink = async (
  boardId: string,
  role: Role,
  inviterId: string,
  expiresIn?: number,
) => {
  const inviterRole = await getInviterBoardRole(inviterId, boardId);

  if (!inviterRole || !(inviterRole in allowedRoles)) {
    return { success: false, error: "permission" };
  }

  const assignableRoles = allowedRoles[inviterRole as "OWNER" | "ADMIN"];
  if (!assignableRoles.includes(role)) {
    return { success: false, error: "permission" };
  }

  const token = generateId(32);
  const expiresAt = expiresIn
    ? new Date(Date.now() + expiresIn * 60 * 60 * 1000)
    : null;

  const invitation = await prisma.boardInvitation.create({
    data: {
      boardId,
      invitedById: inviterId,
      role,
      token,
      expiresAt,
    },
  });

  return {
    success: true,
    invitation: {
      token: invitation.token,
      role: invitation.role,
      boardId: invitation.boardId,
      expiresAt: invitation.expiresAt,
    },
  };
};

export const inviteUserToBoard = async (
  boardId: string,
  userId: string,
  role: Role,
  inviterId: string,
) => {
  const inviterRole = await getInviterBoardRole(inviterId, boardId);

  if (!inviterRole || !(inviterRole in allowedRoles)) {
    return { success: false, error: "permission" };
  }

  const assignableRoles = allowedRoles[inviterRole as "OWNER" | "ADMIN"];
  if (!assignableRoles.includes(role)) {
    return { success: false, error: "permission" };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { success: false, error: "user_not_found" };
  }

  const existingMember = await prisma.boardMember.findUnique({
    where: {
      userId_boardId: {
        userId,
        boardId,
      },
    },
  });

  if (existingMember) {
    return { success: false, error: "already_member" };
  }

  const boardMember = await prisma.boardMember.create({
    data: {
      userId,
      boardId,
      role,
    },
  });

  return { success: true, boardMember };
};

export const acceptInvitation = async (token: string, userId: string) => {
  const invitation = await prisma.boardInvitation.findUnique({
    where: { token },
  });

  if (!invitation) {
    return { success: false, error: "invitation_not_found" };
  }

  if (invitation.expiresAt && invitation.expiresAt < new Date()) {
    await prisma.boardInvitation.delete({ where: { id: invitation.id } });
    return { success: false, error: "invitation_expired" };
  }

  const existingMember = await prisma.boardMember.findUnique({
    where: {
      userId_boardId: {
        userId,
        boardId: invitation.boardId,
      },
    },
  });

  if (existingMember) {
    await prisma.boardInvitation.delete({ where: { id: invitation.id } });
    return { success: false, error: "already_member" };
  }

  const [boardMember] = await prisma.$transaction([
    prisma.boardMember.create({
      data: {
        userId,
        boardId: invitation.boardId,
        role: invitation.role,
      },
    }),
    prisma.boardInvitation.delete({ where: { id: invitation.id } }),
  ]);

  return { success: true, boardMember };
};
