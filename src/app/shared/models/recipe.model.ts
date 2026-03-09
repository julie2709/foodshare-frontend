export interface Recipe {
  id: number;
  title: string;
  ingredients: string[] | string;
  steps: string[] | string;
  time?: number;
  difficulty?: string;
  tags?: string;
}