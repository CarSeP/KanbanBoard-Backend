import { swaggerMiddleware } from "@middlewares/swagger.middleware";
import { Router } from "express";
import swaggerUI from "swagger-ui-express";

export const swaggerRouter = Router();

swaggerRouter.use(swaggerMiddleware);

if (process.env.NODE_ENV !== "production") {
  import("./../../swagger.json")
    .then((swaggerDocument) => {
      swaggerRouter.use(
        "/",
        swaggerUI.serve,
        swaggerUI.setup(swaggerDocument.default || swaggerDocument),
      );
    })
    .catch(() => {
      console.warn("Swagger document not found, skipping Swagger");
    });
}
