import { Column } from "@interfaces/column.interface";
import { generateId } from "@services/id.service";
import { createBoard, deleteBoard } from "@services/board.service";
import {
  upsertColumn,
  deleteColumn,
  moveColumn,
  validateColumn,
} from "@services/column.service";
import { createUserAsGuest } from "@services/auth.service";
import { prisma } from "@services/prisma.service";

describe("Column Tests", () => {
  const boardId = generateId(7);
  let columnId = 0;
  let columnId2 = 0;
  let userId = "";

  beforeAll(async () => {
    const user = await createUserAsGuest();
    userId = user.id;
  });

  test("Create board for column tests", async () => {
    const board = await createBoard(
      { id: boardId, name: "Column Test Board" },
      userId,
    );

    expect(board.name).toBe("Column Test Board");
  });

  test("Create column", async () => {
    const result = await upsertColumn(
      { title: "Column #1", order: 1, boardId },
      userId,
    );
    const column = result[0] as Column;

    columnId = column.id;

    expect(result[1]).toBe("create");
    expect(column.title).toBe("Column #1");
  });

  test("Update column", async () => {
    const result = await upsertColumn(
      { id: columnId, title: "Column #1 Updated", order: 1, boardId },
      userId,
    );
    const column = result[0] as Column;

    expect(result[1]).toBe("update");
    expect(column.title).toBe("Column #1 Updated");
  });

  test("Create second column", async () => {
    const result = await upsertColumn(
      { title: "Column #2", order: 2, boardId },
      userId,
    );
    const column = result[0] as Column;

    columnId2 = column.id;

    expect(result[1]).toBe("create");
    expect(column.title).toBe("Column #2");
  });

  test("Move column", async () => {
    const result = await moveColumn(columnId2, 1, userId);
    const column = result[0] as Column | false;

    let order = null;

    if (column) order = column.order;

    expect(order).toBe(1);
  });

  test("Delete column", async () => {
    const result = await deleteColumn(columnId, userId);
    const column = result[0] as Column | null;

    expect(column).not.toBe(null);
  });

  test("Delete non-existent column", async () => {
    const result = await deleteColumn(99999, userId);

    expect(result[1]).toBe(false);
  });

  test("Validate valid column", () => {
    const result = validateColumn({
      id: columnId,
      title: "Test",
      order: 1,
      boardId,
    });

    expect(result.validate).toBe(true);
  });

  test("Validate invalid column", () => {
    const result = validateColumn({});

    expect(result.validate).toBe(false);
  });

  afterAll(async () => {
    await deleteBoard(boardId);
    await prisma.user.delete({ where: { id: userId } });
  });
});
