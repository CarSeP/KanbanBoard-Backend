import { Board } from "../interfaces/board.interface";
import { BoardSchema } from "../schema/board.schema";
import { prisma } from "./prisma.service";

export const validateBoard = (object: any) => {
  const result = BoardSchema.safeParse(object);

  if (!result.success) {
    return {
      validate: false,
      errors: result.error.issues.map((issue) => {
        const inputName = issue.path[0];
        return inputName
          ? `${String(inputName)}: ${issue.message}`
          : issue.message;
      }),
    };
  }

  return {
    validate: true,
  };
};

export const getAllBoards = async () => {
  const [boards, totalCount] = await prisma.$transaction([
    prisma.board.findMany(),
    prisma.board.count({}),
  ]);

  return [boards, totalCount];
};

export const getUniqueBoard = async (id: string) => {
  const board = await prisma.board.findUnique({
    where: {
      id,
    },
  });

  return board;
};

export const deleteBoard = async (id: string) => {
  const exist = await existBoard(id);

  if (!exist) {
    return false;
  }

  await prisma.board.delete({
    where: {
      id,
    },
  });

  return true;
};

export const upsertBoard = async (board: Board) => {
  const exist = await existBoard(board.id);

  if (exist) {
    updateBoard(board);
    return;
  }

  createBoard(board);
};

const existBoard = async (id: string) => {
  return await prisma.board.findUnique({
    where: {
      id,
    },
  });
};

const createBoard = async (board: Board) => {
  await prisma.board.create({
    data: board,
  });
};

const updateBoard = async (board: Board) => {
  await prisma.board.update({
    where: {
      id: board.id,
    },
    data: board,
  });
};
