export interface RecipePhoto {
  id: number;
  url: string;
  publicUrl: string | null;
}

export interface Recipe {
  id: number;
  title: string;
  ingredients: string;
  steps: string;
  timeMinutes: number | null;
  difficulty: string | null;
  tags: string | null;
  createdAt: string;
  photos: RecipePhoto[];
}

export interface CreateRecipePayload {
  title: string;
  ingredients: string;
  steps: string;
  timeMinutes?: number;
  difficulty?: string;
  tags?: string;
  photo: File;
}

export interface UpdateRecipePayload {
  title?: string;
  ingredients?: string;
  steps?: string;
  timeMinutes?: number | null;
  difficulty?: string;
  tags?: string;
  photo?: File;
}