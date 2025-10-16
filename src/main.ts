import express from "express";
import pino from "pino-http";
import { boardRouter } from "@routers/board.router";
import { swaggerRouter } from "@routers/swagger.router";

const app = express();

app.use(express.json());
app.use(pino());

app.use("/swagger", swaggerRouter);
app.use("/board", boardRouter);

export default app;
