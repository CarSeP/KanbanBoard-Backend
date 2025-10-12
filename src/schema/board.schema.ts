import z from "zod";

export const BoardSchema = z.object({
  id: z.string().max(7).min(7),
  name: z.string().max(30).min(1),
});
