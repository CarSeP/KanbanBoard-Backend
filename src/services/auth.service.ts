import { generateId } from "./id.service";
import { prisma } from "./prisma.service";
import jwt from "jsonwebtoken";

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
