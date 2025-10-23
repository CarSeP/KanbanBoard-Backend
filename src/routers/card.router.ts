import { cardController } from "@controller/card.controller";
import { Router } from "express";

export const cardRouter = Router();

cardRouter.put("/", cardController.upsertOne);
cardRouter.delete("/:id", cardController.deleteOne);
