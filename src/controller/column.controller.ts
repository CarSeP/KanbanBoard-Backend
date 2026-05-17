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

    const userId = req.user.id;
    const [column, action, permissionError] = await upsertColumn(body, userId);

    if (permissionError) {
      return res.status(403).json({
        success: false,
        message: ["You don't have permission to edit or create a column"],
      });
    }

    return res.status(200).json({
      success: true,
      column: column,
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
    const userId = req.user.id;
    const [column, permissionError] = await deleteColumn(id, userId);

    if (permissionError) {
      return res.status(403).json({
        success: false,
        message: ["You don't have permission to delete this column"],
      });
    }

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
    const userId = req.user.id;

    const [column, permissionError] = await moveColumn(id, order, userId);

    if (permissionError) {
      return res.status(403).json({
        success: false,
        message: ["You don't have permission to move this column"],
      });
    }

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
