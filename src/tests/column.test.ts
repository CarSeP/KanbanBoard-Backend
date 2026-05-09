import { generateId } from "@services/id.service";
import { createBoard, deleteBoard } from "@services/board.service";
import {
  upsertColumn,
  deleteColumn,
  moveColumn,
  validateColumn,
} from "@services/column.service";

describe("Column Tests", () => {
  const boardId = generateId(7);
  let columnId = 0;
  let columnId2 = 0;

  test("Create board for column tests", async () => {
    const board = await createBoard({
      id: boardId,
      name: "Column Test Board",
    });

    expect(board.name).toBe("Column Test Board");
  });

  test("Create column", async () => {
    const [column, action] = await upsertColumn({
      title: "Column #1",
      order: 1,
      boardId,
    });

    columnId = column.id;

    expect(action).toBe("create");
    expect(column.title).toBe("Column #1");
  });

  test("Update column", async () => {
    const [column, action] = await upsertColumn({
      id: columnId,
      title: "Column #1 Updated",
      order: 1,
      boardId,
    });

    expect(action).toBe("update");
    expect(column.title).toBe("Column #1 Updated");
  });

  test("Create second column", async () => {
    const [column, action] = await upsertColumn({
      title: "Column #2",
      order: 2,
      boardId,
    });

    columnId2 = column.id;

    expect(action).toBe("create");
    expect(column.title).toBe("Column #2");
  });

  test("Move column", async () => {
    const column = await moveColumn(columnId2, 1);
    let order = null;

    if (column) order = column.order;

    expect(order).toBe(1);
  });

  test("Delete column", async () => {
    const column = await deleteColumn(columnId);

    expect(column).not.toBe(false);
  });

  test("Delete non-existent column", async () => {
    const result = await deleteColumn(99999);

    expect(result).toBe(false);
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

  test("Delete board and cleanup", async () => {
    const result = await deleteBoard(boardId);

    expect(result).toBe(true);
  });
});
