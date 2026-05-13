export interface User {
  id: string;
  email: string | null;
  name: string;
  provider: "GOOGLE" | "GUEST";
  createdAt: Date;
  updatedAt: Date;
}
