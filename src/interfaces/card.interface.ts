export interface Card {
  id: number;
  title: string;
  content?: string;
  order: number;
  columnId: number;
  createdAt?: Date;
  updatedAt?: Date;
}
