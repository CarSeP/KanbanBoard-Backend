import { Card } from "@interfaces/card.interface";
import { CardSchema } from "@schemas/card.schema";
import { prisma } from "./prisma.service";
import { hasPermission } from "./auth.service";

type CardType = Omit<Card, "id"> & { id?: number };

type UpsertCardType = (
  card: CardType,
  userId: string,
) => Promise<[Card | null, string | null, boolean]>;

export const upsertCard: UpsertCardType = async (card, userId) => {
  const exist = await existCard(card.id);
  const board = await findBoardByColumnId(card.columnId);

  if (!board) return [null, null, true];
  const boardId = board.id;

  const canUpsert = await hasPermission(userId, boardId, "EDITOR");

  if (!canUpsert) return [null, null, true];

  if (exist) {
    return [await updateCard(card), "update", false];
  }

  return [await createCard(card), "create", false];
};

export const deleteCard = async (id: number, userId: string) => {
  const exist = await existCard(id);
  const board = await findBoardByCardId(id);

  if (!exist || !board) return [false, false];

  const boardId = board.id;

  const canDeleteCard = await hasPermission(userId, boardId, "EDITOR");

  if (!canDeleteCard) return [false, true];

  const card = await prisma.card.delete({
    where: {
      id,
    },
  });

  return [card, false];
};

type MoveCardType = (
  id: number,
  columnId: number,
  order: number,
  userId: string,
) => Promise<[Card | false, boolean]>;

export const moveCard: MoveCardType = async (id, columnId, order, userId) => {
  const exist = await existCard(id);
  const board = await findBoardByCardId(id);

  if (!exist || !board) return [false, false];

  const boardId = board.id;
  const canMoveColumn = await hasPermission(userId, boardId, "EDITOR");

  if (!canMoveColumn) return [false, true];

  if (exist.columnId === columnId) {
    const shiftCondition =
      exist.order < order
        ? { where: { lte: order }, data: { decrement: 1 } }
        : { where: { gte: order }, data: { increment: 1 } };

    const [card] = await prisma.$transaction([
      prisma.card.update({ where: { id }, data: { order } }),
      prisma.card.updateMany({
        where: {
          AND: [
            { id: { not: id } },
            { columnId },
            { order: shiftCondition.where },
          ],
        },
        data: { order: shiftCondition.data },
      }),
    ]);

    return [card, false];
  }

  const [, , card] = await prisma.$transaction([
    prisma.card.updateMany({
      where: {
        AND: [{ columnId: exist.columnId }, { order: { gt: exist.order } }],
      },
      data: { order: { decrement: 1 } },
    }),
    prisma.card.updateMany({
      where: { AND: [{ columnId }, { order: { gte: order } }] },
      data: { order: { increment: 1 } },
    }),
    prisma.card.update({ where: { id }, data: { columnId, order } }),
  ]);

  return [card, false];
};

export const validateCard = (object: unknown) => {
  const result = CardSchema.safeParse(object);

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

export const findBoardByColumnId = async (columnId: number) => {
  if (!columnId || typeof columnId == "string") return null;

  const column = await prisma.column.findUnique({
    where: { id: columnId },
    include: {
      board: true,
    },
  });

  return column?.board ?? null;
};

export const findBoardByCardId = async (cardId: number) => {
  if (!cardId || typeof cardId == "string") return null;

  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: {
      column: {
        include: {
          board: true,
        },
      },
    },
  });

  return card?.column.board ?? null;
};

const existCard = async (id: number | undefined) => {
  if (!id) return false;

  return await prisma.card.findUnique({
    where: {
      id,
    },
  });
};

const createCard = async (card: CardType) => {
  return await prisma.card.create({
    data: card,
  });
};

const updateCard = async (card: CardType) => {
  return await prisma.card.update({
    where: {
      id: card.id,
    },
    data: card,
  });
};
