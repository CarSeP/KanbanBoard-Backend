import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { getPinoConfig } from "@services/pino.service";
import { getCors } from "@services/cors.service";
import { authMiddleware } from "@middlewares/auth.middleware";
import { boardRouter } from "@routers/board.router";
import { swaggerRouter } from "@routers/swagger.router";
import { notFoundRouter } from "@routers/notFound.router";
import { columnRouter } from "@routers/column.router";
import { cardRouter } from "@routers/card.router";
import { authRouter } from "@routers/auth.router";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(getPinoConfig());
app.use(cors(getCors()));
app.use("/swagger", swaggerRouter);
app.use("/auth", authRouter);
app.use(authMiddleware);
app.use("/board", boardRouter);
app.use("/column", columnRouter);
app.use("/card", cardRouter);
app.use(notFoundRouter);

export default app;
