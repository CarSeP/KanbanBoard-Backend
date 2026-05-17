import { Card } from "@interfaces/card.interface";
import { Column } from "@interfaces/column.interface";
import { generateId } from "@services/id.service";
import { createBoard, deleteBoard } from "@services/board.service";
import { upsertColumn } from "@services/column.service";
import {
  upsertCard,
  deleteCard,
  moveCard,
  validateCard,
} from "@services/card.service";
import { createUserAsGuest } from "@services/auth.service";
import { prisma } from "@services/prisma.service";

describe("Card Tests", () => {
  const boardId = generateId(7);
  let columnId = 0;
  let columnId2 = 0;
  let cardId = 0;
  let userId = "";

  beforeAll(async () => {
    const user = await createUserAsGuest();
    userId = user.id;
  });

  test("Create board for card tests", async () => {
    const board = await createBoard(
      { id: boardId, name: "Card Test Board" },
      userId,
    );

    expect(board.name).toBe("Card Test Board");
  });

  test("Create column for card tests", async () => {
    const result = await upsertColumn(
      { title: "Card Column", order: 1, boardId },
      userId,
    );
    const column = result[0] as Column;

    columnId = column.id;

    expect(column.title).toBe("Card Column");
  });

  test("Create card", async () => {
    const result = await upsertCard(
      { title: "Card #1", content: "Card #1 content", order: 1, columnId },
      userId,
    );
    const card = result[0] as Card;

    cardId = card.id;

    expect(result[1]).toBe("create");
    expect(card.title).toBe("Card #1");
  });

  test("Update card", async () => {
    const result = await upsertCard(
      {
        id: cardId,
        title: "Card #1 Updated",
        content: "Updated content",
        order: 1,
        columnId,
      },
      userId,
    );
    const card = result[0] as Card;

    expect(result[1]).toBe("update");
    expect(card.title).toBe("Card #1 Updated");
    expect(card.content).toBe("Updated content");
  });

  test("Create second card for move test", async () => {
    const result = await upsertCard(
      { title: "Card #2", content: "Card #2 content", order: 2, columnId },
      userId,
    );

    expect(result[1]).toBe("create");
  });

  test("Move card within same column", async () => {
    const result = await moveCard(cardId, columnId, 2, userId);
    const card = result[0] as Card | false;

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
    const result = await upsertColumn(
      { title: "Second Column", order: 2, boardId },
      userId,
    );
    const column = result[0] as Column;

    columnId2 = column.id;

    expect(column.title).toBe("Second Column");
  });

  test("Move card to different column", async () => {
    const result = await moveCard(cardId, columnId2, 1, userId);
    const card = result[0] as Card | false;

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
    const result = await deleteCard(cardId, userId);
    const card = result[0] as Card | false;

    expect(card).not.toBe(false);
  });

  test("Delete non-existent card", async () => {
    const result = await deleteCard(99999, userId);

    expect(result[1]).toBe(false);
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

  afterAll(async () => {
    await deleteBoard(boardId);
    await prisma.user.delete({ where: { id: userId } });
  });
});
