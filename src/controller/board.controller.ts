import { Request, Response } from "express";
import {
  deleteBoard,
  getAllBoards,
  getUniqueBoard,
  upsertBoard,
  validateBoard,
} from "@services/board.service";

const getAll = async (req: Request, res: Response) => {
  try {
    const [boards, totalCount] = await getAllBoards();

    return res.status(200).json({
      success: true,
      totalCount,
      boards,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: ["Server error"],
    });
  }
};

const getOne = async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: ["Server error"],
    });
  }
};

const deleteOne = async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
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

    const [board, action] = await upsertBoard(body);
    return res.status(200).json({
      success: true,
      board: await board,
      action,
    });
  } catch (error) {
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
