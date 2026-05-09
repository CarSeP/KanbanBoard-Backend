import { Column } from "@interfaces/column.interface";
import { ColumnSchema } from "@schemas/column.schema";
import { prisma } from "@services/prisma.service";

type ColumnType = Omit<Column, "id"> & { id?: number };

export const upsertColumn = async (column: ColumnType): Promise<[Column, string]> => {
  const exist = await existColumn(column.id);

  if (exist) {
    return [await updateColumn(column), "update"];
  }

  return [await createColumn(column), "create"];
};

export const deleteColumn = async (id: number) => {
  const exist = await existColumn(id);

  if (!exist) return false;

  return await prisma.column.delete({
    where: {
      id,
    },
  });
};

export const moveColumn = async (id: number, order: number) => {
  const exist = await existColumn(id);

  if (!exist) return false;

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

  return column;
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
