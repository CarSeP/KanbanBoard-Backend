import { generateId } from "@services/id.service";
import {
  createUserAsGuest,
  getToken,
  validateToken,
  hasPermission,
} from "@services/auth.service";
import { prisma } from "@services/prisma.service";
import { createBoard, deleteBoard } from "@services/board.service";

describe("Auth Tests", () => {
  let userId = "";
  let boardId = "";
  let token = "";

  beforeAll(async () => {
    const user = await createUserAsGuest();
    userId = user.id;

    const board = await createBoard(
      { id: generateId(7), name: "Auth Test Board" },
      userId,
    );
    boardId = board.id;

    token = await getToken(userId);
  });

  test("Create guest user", async () => {
    const user = await createUserAsGuest();

    expect(user.name).toMatch(/^Guest\d+$/);
    expect(user.provider).toBe("GUEST");

    await prisma.user.delete({ where: { id: user.id } });
  });

  test("Generate token", async () => {
    const newToken = await getToken(userId);

    expect(typeof newToken).toBe("string");
    expect(newToken.length).toBeGreaterThan(0);
  });

  test("Validate valid token", async () => {
    const [valid, user] = await validateToken(token);

    expect(valid).toBe(true);
    expect(user).not.toBe(null);
    expect(user?.id).toBe(userId);
  });

  test("Validate invalid token", async () => {
    const [valid, user] = await validateToken("invalid-token-string");

    expect(valid).toBe(false);
    expect(user).toBe(null);
  });

  test("Validate token for non-existent user", async () => {
    const fakeUserId = "nonexistent123";
    const fakeToken = await getToken(fakeUserId);

    const [valid, user] = await validateToken(fakeToken);

    expect(valid).toBe(false);
    expect(user).toBe(null);
  });

  test("Has permission as OWNER", async () => {
    const result = await hasPermission(userId, boardId, "OWNER");

    expect(result).toBe(true);
  });

  test("Has permission lower role as OWNER", async () => {
    const result = await hasPermission(userId, boardId, "VIEWER");

    expect(result).toBe(true);
  });

  test("No permission for non-member", async () => {
    const otherUser = await createUserAsGuest();
    const result = await hasPermission(otherUser.id, boardId, "VIEWER");

    expect(result).toBe(false);

    await prisma.user.delete({ where: { id: otherUser.id } });
  });

  test("No permission for non-existent board", async () => {
    const result = await hasPermission(userId, "nonexistent-board", "VIEWER");

    expect(result).toBe(false);
  });

  afterAll(async () => {
    await deleteBoard(boardId);
    await prisma.user.delete({ where: { id: userId } });
  });
});
