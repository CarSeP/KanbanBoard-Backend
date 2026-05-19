import z from "zod";

export const InviteLinkSchema = z.object({
  role: z.enum(["ADMIN", "EDITOR", "VIEWER"]),
  expiresIn: z.number().positive().optional(),
}).strict();

export const InviteUserSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["ADMIN", "EDITOR", "VIEWER"]),
}).strict();

export const validateInviteLink = (object: unknown) => {
  const result = InviteLinkSchema.safeParse(object);

  if (!result.success) {
    return {
      validate: false,
      errors: result.error.issues.map((issue) => {
        const inputName = issue.path[0];
        return inputName
          ? `${String(inputName)}: ${issue.message}`
          : issue.message;
      }),
    };
  }

  return { validate: true };
};

export const validateInviteUser = (object: unknown) => {
  const result = InviteUserSchema.safeParse(object);

  if (!result.success) {
    return {
      validate: false,
      errors: result.error.issues.map((issue) => {
        const inputName = issue.path[0];
        return inputName
          ? `${String(inputName)}: ${issue.message}`
          : issue.message;
      }),
    };
  }

  return { validate: true };
};
