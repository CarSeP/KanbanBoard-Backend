import { deleteCard, moveCard, upsertCard, validateCard } from "@services/card.service";
import { Request, Response } from "express";

const upsertOne = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const validate = validateCard(body);

    if (!validate.validate) {
      return res.status(400).json({
        success: false,
        message: validate.errors,
      });
    }

    const [card, action] = await upsertCard(body);
    return res.status(200).json({
      success: true,
      card,
      action,
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
    const id = Number(req.params.id);
    const card = await deleteCard(id);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: ["Card not found"],
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

const moveOne = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const columnId = Number(req.params.columnId);
    const order = Number(req.params.order);

    const card = await moveCard(id, columnId, order);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: ["Card not found"],
      });
    }

    return res.json({
      success: true,
      card,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: ["Server error"],
    });
  }
};

export const cardController = {
  upsertOne,
  deleteOne,
  moveOne,
};
