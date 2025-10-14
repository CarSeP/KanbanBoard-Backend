import { verifyDatabaseConnection } from "./src/services/prisma.service";
import app from "./src/main";

const port = process.env.PORT || 3000;

app.listen(port, async () => {
  console.log(`App listening on port ${port}`);

  if (await verifyDatabaseConnection()) {
    console.log("Connection to the database established successfully");
  } else {
    console.log("Error connecting to the database");
  }
});
