import z from "zod";

export const ColumnSchema = z.object({
  id: z.number().optional(),
  title: z.string().max(50).min(1),
  order: z.int(),
  boardId:  z.string().max(7).min(7)
}).strict();
