import { Card } from "@interfaces/card.interface";
import { CardSchema } from "@schemas/card.schema";
import { prisma } from "./prisma.service";

type CardType = Omit<Card, "id"> & { id?: number };

export const upsertCard = async (card: CardType): Promise<[Card, string]> => {
  const exist = await existCard(card.id);

  if (exist) {
    return [await updateCard(card), "update"];
  }

  return [await createCard(card), "create"];
};

export const deleteCard = async (id: number) => {
  const exist = await existCard(id);

  if (!exist) return false;

  return await prisma.card.delete({
    where: {
      id,
    },
  });
};

export const moveCard = async (id: number, columnId: number, order: number) => {
  const exist = await existCard(id);
  if (!exist) return false;

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

    return card;
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

  return card;
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
