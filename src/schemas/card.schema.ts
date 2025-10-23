import z from "zod";

export const CardSchema = z.object({
  id: z.number().optional(),
  title: z.string().max(50).min(1),
  content: z.string().min(1).optional(),
  order: z.int(),
  columnId: z.number()
}).strict();
