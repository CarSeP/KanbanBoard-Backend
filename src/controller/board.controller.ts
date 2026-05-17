import { Request, Response } from "express";
import {
  deleteBoard,
  getAllBoards,
  getUniqueBoard,
  upsertBoard,
  validateBoard,
} from "@services/board.service";
import { hasPermission } from "@services/auth.service";

const getAll = async (req: Request, res: Response) => {
  try {
    const userID = req.user.id;
    const [boards, totalCount] = await getAllBoards(userID);

    return res.status(200).json({
      success: true,
      totalCount,
      boards,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: ["Server error"],
    });
  }
};

const getOne = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const userID = req.user.id;
    const board = await getUniqueBoard(id, userID);

    if (!board)
      return res.status(404).json({
        success: false,
        message: ["Board not found"],
      });

    return res.status(200).json({
      success: true,
      board,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: ["Server error"],
    });
  }
};

const deleteOne = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const userID = req.user.id;
    const canDeleteBoard = await hasPermission(userID, id, "OWNER");

    if (!canDeleteBoard) {
      return res.status(403).json({
        success: false,
        message: ["You don't have permission to delete this board"],
      });
    }

    const board = await deleteBoard(id);

    if (!board)
      return res.status(404).json({
        success: false,
        message: ["Board not found"],
      });

    return res.status(200).json({
      success: true,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: ["Server error"],
    });
  }
};

const upsertOne = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const validate = validateBoard(body);

    if (!validate.validate) {
      return res.status(400).json({
        success: false,
        message: validate.errors,
      });
    }

    const userID = req.user.id;
    const [board, action, permissionError] = await upsertBoard(body, userID);

    if (permissionError) {
      return res.status(403).json({
        success: false,
        message: ["You don't have permission to edit this board"],
      });
    }

    return res.status(200).json({
      success: true,
      board,
      action,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: ["Server error"],
    });
  }
};

export const boardController = {
  getAll,
  getOne,
  deleteOne,
  upsertOne,
};
