import { generateId } from "@services/id.service";
import { createBoard, deleteBoard } from "@services/board.service";
import { upsertColumn } from "@services/column.service";
import {
  upsertCard,
  deleteCard,
  moveCard,
  validateCard,
} from "@services/card.service";

describe("Card Tests", () => {
  const boardId = generateId(7);
  let columnId = 0;
  let columnId2 = 0;
  let cardId = 0;

  test("Create board for card tests", async () => {
    const board = await createBoard({
      id: boardId,
      name: "Card Test Board",
    });

    expect(board.name).toBe("Card Test Board");
  });

  test("Create column for card tests", async () => {
    const [column] = await upsertColumn({
      title: "Card Column",
      order: 1,
      boardId,
    });

    columnId = column.id;

    expect(column.title).toBe("Card Column");
  });

  test("Create card", async () => {
    const [card, action] = await upsertCard({
      title: "Card #1",
      content: "Card #1 content",
      order: 1,
      columnId,
    });

    cardId = card.id;

    expect(action).toBe("create");
    expect(card.title).toBe("Card #1");
  });

  test("Update card", async () => {
    const [card, action] = await upsertCard({
      id: cardId,
      title: "Card #1 Updated",
      content: "Updated content",
      order: 1,
      columnId,
    });

    expect(action).toBe("update");
    expect(card.title).toBe("Card #1 Updated");
    expect(card.content).toBe("Updated content");
  });

  test("Create second card for move test", async () => {
    const [card, action] = await upsertCard({
      id: 0,
      title: "Card #2",
      content: "Card #2 content",
      order: 2,
      columnId,
    });

    expect(action).toBe("create");
  });

  test("Move card within same column", async () => {
    const card = await moveCard(cardId, columnId, 2);

    let order = null;
    let columnID = null;

    if (card) {
      order = card.order;
      columnID = card.columnId;
    }

    expect(columnID).toBe(columnId);
    expect(order).toBe(2);
  });

  test("Create second column for cross-column move", async () => {
    const [column] = await upsertColumn({
      id: 0,
      title: "Second Column",
      order: 2,
      boardId,
    });

    columnId2 = column.id;

    expect(column.title).toBe("Second Column");
  });

  test("Move card to different column", async () => {
    const card = await moveCard(cardId, columnId2, 1);
    let order = null;
    let columnID = null;

    if (card) {
      order = card.order;
      columnID = card.columnId;
    }

    expect(columnID).toBe(columnId2);
    expect(order).toBe(1);
  });

  test("Delete card", async () => {
    const card = await deleteCard(cardId);

    expect(card).not.toBe(false);
  });

  test("Delete non-existent card", async () => {
    const result = await deleteCard(99999);

    expect(result).toBe(false);
  });

  test("Validate valid card", () => {
    const result = validateCard({
      id: cardId,
      title: "Test",
      content: "Test content",
      order: 1,
      columnId: 1,
    });

    expect(result.validate).toBe(true);
  });

  test("Validate invalid card", () => {
    const result = validateCard({});

    expect(result.validate).toBe(false);
  });

  test("Delete board and cleanup", async () => {
    const result = await deleteBoard(boardId);

    expect(result).toBe(true);
  });
});
