import { verifyDatabaseConnection } from "@services/prisma.service";

test("verify connection to the database", async () => {
  expect(await verifyDatabaseConnection()).toBe(true);
});
