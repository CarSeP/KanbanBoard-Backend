import express from "express";
import { boardRouter } from "./routers/board.router";

const app = express();

app.use(express.json());
app.use("/board", boardRouter)

export default app;
