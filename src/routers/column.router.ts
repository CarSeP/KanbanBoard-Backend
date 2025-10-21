import { columnController } from "@controller/column.controller";
import { Router } from "express";

export const columnRouter = Router();

columnRouter.put("/", columnController.upsertOne);
columnRouter.delete("/:id", columnController.deleteOne);
columnRouter.post("/:id/:order", columnController.moveAll);
