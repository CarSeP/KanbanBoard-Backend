import { Board } from "@interfaces/board.interface";
import { BoardSchema } from "@schemas/board.schema";
import { prisma } from "@services/prisma.service";
import { generateId } from "./id.service";
import { hasPermission } from "./auth.service";

export const validateBoard = (object: unknown) => {
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

export const getAllBoards = async (userId: string) => {
  const [boards, totalCount] = await prisma.$transaction([
    prisma.board.findMany({
      where: {
        boardMembers: {
          some: {
            userId,
          },
        },
      },
    }),
    prisma.board.count({
      where: {
        boardMembers: {
          some: {
            userId,
          },
        },
      },
    }),
  ]);

  return [boards, totalCount];
};

export const getUniqueBoard = async (id: string, userId: string) => {
  const board = await prisma.board.findUnique({
    where: {
      id,
      boardMembers: {
        some: {
          userId,
        },
      },
    },
    include: {
      columns: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        include: {
          cards: {
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          },
        },
      },
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

export const upsertBoard = async (board: Board, userId: string) => {
  const boardId = board.id;
  const exist = await existBoard(boardId);

  if (!exist) {
    return [await createBoard(board, userId), "create", false];
  }

  const canEdit = await hasPermission(userId, boardId, "ADMIN");

  if(!canEdit) {
    return [null, "update", true];
  }

  return [await updateBoard(board), "update", false];
};

export const existBoard = async (id: string) => {
  if (!id) return false;

  return await prisma.board.findUnique({
    where: {
      id,
    },
  });
};

export const createBoard = async (board: Board, userId: string) => {
  if (!board.id) board.id = generateId(7);
  return await prisma.$transaction(async (tx) => {
    const newBoard = await tx.board.create({
      data: board,
    });

    await tx.boardMember.create({
      data: {
        userId,
        boardId: newBoard.id,
        role: "OWNER",
      },
    });

    return newBoard;
  });
};

export const updateBoard = async (board: Board) => {
  return await prisma.board.update({
    where: {
      id: board.id,
    },
    data: board,
  });
};
