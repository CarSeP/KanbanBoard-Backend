import { Card } from "@interfaces/card.interface";
import { CardSchema } from "@schemas/card.schema";
import { prisma } from "./prisma.service";

export const upsertCard = async (card: Card) => {
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

const existCard = async (id: number) => {
  if (!id) return false;

  return await prisma.card.findUnique({
    where: {
      id,
    },
  });
};

const createCard = async (card: Card) => {
  return await prisma.card.create({
    data: card,
  });
};

const updateCard = async (card: Card) => {
  return await prisma.card.update({
    where: {
      id: card.id,
    },
    data: card,
  });
};
