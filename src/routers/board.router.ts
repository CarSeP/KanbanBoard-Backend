import { Router } from "express";
import {
  deleteBoard,
  getAllBoards,
  getUniqueBoard,
  upsertBoard,
  validateBoard,
} from "@services/board.service";

export const boardRouter = Router();

boardRouter.get("/", async (req, res) => {
  const [boards, totalCount] = await getAllBoards();

  return res.status(200).json({
    success: true,
    totalCount,
    boards,
  });
});

boardRouter.get("/:id", async (req, res) => {
  const id = req.params.id;
  const board = await getUniqueBoard(id);

  if (!board)
    return res.status(404).json({
      success: false,
      message: ["Board not found"],
    });

  return res.status(200).json({
    success: true,
    board,
  });
});

boardRouter.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const board = await deleteBoard(id);

  if (!board)
    return res.status(404).json({
      success: false,
      message: ["Board not found"],
    });

  return res.status(200).json({
    success: true,
  });
});

boardRouter.put("/", async (req, res) => {
  const body = req.body;
  const validate = validateBoard(body);

  if (!validate.validate) {
    return res.status(400).json({
      success: false,
      message: validate.errors,
    });
  }

  await upsertBoard(body);

  return res.status(200).json({
    success: true,
  });
});
