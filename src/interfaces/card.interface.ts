export interface Card {
  id: number;
  title: string;
  content: string | null;
  order: number;
  columnId: number;
  createdAt?: Date;
  updatedAt?: Date;
}
