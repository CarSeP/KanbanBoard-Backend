import express from "express";
import { boardRouter } from "@routers/board.router";
import swaggerUI from "swagger-ui-express";
import swaggerDocument from "./../swagger.json"

const app = express();

app.use(express.json());
app.use("/board", boardRouter);
app.use("/swagger", swaggerUI.serve, swaggerUI.setup(swaggerDocument))

export default app;
