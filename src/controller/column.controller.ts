import {
  deleteColumn,
  moveColumn,
  upsertColumn,
  validateColumn,
} from "@services/column.service";
import { Request, Response } from "express";

const upsertOne = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const validate = validateColumn(body);

    if (!validate.validate) {
      return res.status(400).json({
        success: false,
        message: validate.errors,
      });
    }

    const [column, action] = await upsertColumn(body);
    return res.status(200).json({
      success: true,
      column: await column,
      action,
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
    const id = Number(req.params.id);
    const column = await deleteColumn(id);

    if (!column) {
      return res.status(404).json({
        success: false,
        message: ["Column not found"],
      });
    }

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

const moveAll = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const order = Number(req.params.order);

    const column = await moveColumn(id, order);

    if (!column) {
      return res.status(404).json({
        success: false,
        message: ["Column not found"],
      });
    }
    return res.json({
      success: true,
      column,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: ["Server error"],
    });
  }
};

export const columnController = {
  upsertOne,
  deleteOne,
  moveAll,
};
