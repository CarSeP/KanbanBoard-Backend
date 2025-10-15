import express from "express";
import { boardRouter } from "@routers/board.router";
import swaggerUI from "swagger-ui-express";
import swaggerDocument from "./../swagger.json";
import pino from "pino-http";

const app = express();

app.use(express.json());
app.use(pino());

app.use("/board", boardRouter);
app.use("/swagger", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

export default app;
