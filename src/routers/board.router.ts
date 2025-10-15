import { boardController } from "controller/board.controller";
import { Router } from "express";

export const boardRouter = Router();

boardRouter.get("/", boardController.getAll);
boardRouter.put("/", boardController.upsertOne);
boardRouter.get("/:id", boardController.getOne);
boardRouter.delete("/:id", boardController.deleteOne);
