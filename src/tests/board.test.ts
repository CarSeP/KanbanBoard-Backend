import { Board } from "@interfaces/board.interface";
import { generateId } from "@services/id.service";
import {
  createBoard,
  deleteBoard,
  getUniqueBoard,
  updateBoard,
} from "@services/board.service";

describe("Board Tests", () => {
  const globalId = generateId(7);
  let globalDeleteBoardId = "";

  test("Create board without id", async () => {
    const board = await createBoard({
      id: "",
      name: "Board Test #1",
    });

    globalDeleteBoardId = board.id;

    expect(board.name).toBe("Board Test #1");
  });

  test("Create board with id", async () => {
    const board = await createBoard({
      id: globalId,
      name: "Board Test #2",
    });

    const newBoard = board as Board;
    expect(newBoard.id).toBe(globalId);
  });

  test("Update board", async () => {
    const board = await updateBoard({
      id: globalId,
      name: "Board Test #3",
    });

    expect(board.name).toBe("Board Test #3");
  });

  test("Find board", async () => {
    const board = await getUniqueBoard(globalId);

    expect(board?.id).toBe(globalId);
  });

  test("Update board", async () => {
    const board = await updateBoard({
      id: globalId,
      name: "Board Test #3",
    });

    expect(board.name).toBe("Board Test #3");
  });

  test("Delete board", async () => {
    const board = await deleteBoard(globalId);

    expect(board).toBe(true);
  });

  test("Delete non-existent board", async () => {
    const board = await deleteBoard(generateId(8));

    expect(board).toBe(false);
  });

  test("Delete board created without id", async () => {
    const board = await deleteBoard(globalDeleteBoardId);

    expect(board).toBe(true);
  });
});
