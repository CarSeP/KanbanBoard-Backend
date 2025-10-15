import swaggerAutogen from "swagger-autogen";

const outPutFile = "./swagger.json";
const endPointsFiles = ["./src/main.ts"];

const doc = {
  info: {
    title: "KanbanBoard",
  },
  host: process.env.APP_URL,
  schemes: ["http"],
};

swaggerAutogen()(outPutFile, endPointsFiles, doc);
