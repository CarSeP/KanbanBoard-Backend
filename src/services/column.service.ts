import { Column } from "@interfaces/column.interface";
import { ColumnSchema } from "@schemas/column.schema";
import { prisma } from "@services/prisma.service";
import { hasPermission } from "./auth.service";

type ColumnType = Omit<Column, "id"> & { id?: number };

export const upsertColumn = async (column: ColumnType, userId: string) => {
  const exist = await existColumn(column.id);

  const boardId = column.boardId;
  const canUpsert = await hasPermission(userId, boardId, "EDITOR");

  if (!canUpsert) {
    return [null, null, true];
  }

  if (exist) {
    return [await updateColumn(column), "update", false];
  }

  return [await createColumn(column), "create", false];
};

export const deleteColumn = async (id: number, userId: string) => {
  const exist = await existColumn(id);

  if (!exist) return [null, false];

  const boardId = exist.boardId;
  const canDeleteColumn = await hasPermission(userId, boardId, "EDITOR");

  if (!canDeleteColumn) return [null, true];

  const column = await prisma.column.delete({
    where: {
      id,
    },
  });

  return [column, false];
};

export const moveColumn = async (id: number, order: number, userId: string) => {
  const exist = await existColumn(id);

  if (!exist) return [false, false];

  const boardId = exist.boardId;
  const canMoveColumn = await hasPermission(userId, boardId, "EDITOR");

  if (!canMoveColumn) return [false, true];

  let condition = null;
  if (exist.order < order) {
    condition = { where: { lte: order }, data: { decrement: 1 } };
  } else {
    condition = { where: { gte: order }, data: { increment: 1 } };
  }

  const [column] = await prisma.$transaction([
    prisma.column.update({
      where: {
        id,
      },
      data: {
        order,
      },
    }),
    prisma.column.updateMany({
      where: {
        AND: [{ id: { not: id } }, { order: condition.where }],
      },
      data: {
        order: condition.data,
      },
    }),
  ]);

  return [column, false];
};

export const validateColumn = (object: unknown) => {
  const result = ColumnSchema.safeParse(object);

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

const existColumn = async (id: number | undefined) => {
  if (!id) return false;

  return await prisma.column.findUnique({
    where: {
      id,
    },
  });
};

const createColumn = async (column: ColumnType) => {
  return await prisma.column.create({
    data: column,
  });
};

const updateColumn = async (column: ColumnType) => {
  return await prisma.column.update({
    where: {
      id: column.id,
    },
    data: column,
  });
};
