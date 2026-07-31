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
import { invitationRouter } from "@routers/invitation.router";
import { verifyDatabaseConnection } from "./services/prisma.service";
import "./websocket"

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(getPinoConfig());
app.use(cors(getCors()));
app.use("/swagger", swaggerRouter);
app.use("/auth", authRouter);
app.use(authMiddleware);
app.use("/board", boardRouter);
app.use("/board", invitationRouter);
app.use("/column", columnRouter);
app.use("/card", cardRouter);
app.use(notFoundRouter);

app.listen(port, async () => {
  console.log(`App listening on port ${port}`);

  if (await verifyDatabaseConnection()) {
    console.log("Connection to the database established successfully");
  } else {
    console.log("Error connecting to the database");
  }
});
