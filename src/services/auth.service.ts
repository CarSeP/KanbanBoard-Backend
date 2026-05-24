import { User } from "@interfaces/user.interface";
import { generateId } from "./id.service";
import { prisma } from "./prisma.service";
import jwt from "jsonwebtoken";
import { Role } from "@interfaces/role.type";

export const createUserAsGuest = async () => {
  const id = generateId(7, "1234567890");
  return await prisma.user.create({
    data: {
      name: `Guest${id}`,
      provider: "GUEST",
    },
  });
};

export const getToken = async (userId: string) => {
  const secret = process.env.JWT_SECRET ?? "";
  const token = jwt.sign({ id: userId, iat: Date.now() }, secret);
  return token;
};

type ValidateTokenType = Promise<[boolean, User | null]>;
export const validateToken = async (token: string): ValidateTokenType => {
  const secret = process.env.JWT_SECRET ?? "";
  try {
    const decoded = jwt.verify(token, secret);

    if (typeof decoded === "string") {
      return [false, null];
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      return [false, null];
    }

    return [true, user];
  } catch {
    return [false, null];
  }
};

export const findOrCreateGoogleUser = async (email: string, name: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return existingUser;
  }

  return await prisma.user.create({
    data: {
      email,
      name,
      provider: "GOOGLE",
    },
  });
};

export const hasPermission = async (
  userId: string,
  boardId: string,
  rol: Role,
) => {
  const roleHierarchy: Record<Role, number> = {
    OWNER: 4,
    ADMIN: 3,
    EDITOR: 2,
    VIEWER: 1,
  };

  const boardMember = await prisma.boardMember.findUnique({
    where: {
      userId_boardId: {
        userId,
        boardId,
      },
    },
  });

  if (!boardMember) return false;

  return roleHierarchy[boardMember.role as Role] >= roleHierarchy[rol];
};
