import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Recipe,
  CreateRecipePayload,
  UpdateRecipePayload
} from '../../shared/models/recipe.model';

export interface RecipeFilters {
  search?: string;
  difficulty?: string;
  tag?: string;
  sort?: 'createdAt' | 'timeMinutes';
  order?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private apiUrl = `${environment.apiUrl}/recipes`;

  constructor(private http: HttpClient) {}

  getAll(filters?: RecipeFilters): Observable<Recipe[]> {
    let params = new HttpParams();

    if (filters?.search) {
      params = params.set('search', filters.search);
    }

    if (filters?.difficulty) {
      params = params.set('difficulty', filters.difficulty);
    }

    if (filters?.tag) {
      params = params.set('tag', filters.tag);
    }

    if (filters?.sort) {
      params = params.set('sort', filters.sort);
    }

    if (filters?.order) {
      params = params.set('order', filters.order);
    }

    return this.http.get<Recipe[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateRecipePayload): Observable<Recipe> {
    const formData = this.buildCreateFormData(payload);
    return this.http.post<Recipe>(this.apiUrl, formData);
  }

  update(id: number, payload: UpdateRecipePayload): Observable<Recipe> {
    const formData = this.buildUpdateFormData(payload);
    return this.http.put<Recipe>(`${this.apiUrl}/${id}`, formData);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  private buildCreateFormData(payload: CreateRecipePayload): FormData {
    const formData = new FormData();

    formData.append('title', payload.title);
    formData.append('ingredients', payload.ingredients);
    formData.append('steps', payload.steps);

    if (payload.timeMinutes !== undefined && payload.timeMinutes !== null) {
      formData.append('timeMinutes', String(payload.timeMinutes));
    }

    if (payload.difficulty) {
      formData.append('difficulty', payload.difficulty);
    }

    if (payload.tags) {
      formData.append('tags', payload.tags);
    }

    formData.append('photos', payload.photo);

    return formData;
  }

  private buildUpdateFormData(payload: UpdateRecipePayload): FormData {
    const formData = new FormData();

    if (payload.title !== undefined) {
      formData.append('title', payload.title);
    }

    if (payload.ingredients !== undefined) {
      formData.append('ingredients', payload.ingredients);
    }

    if (payload.steps !== undefined) {
      formData.append('steps', payload.steps);
    }

    if (payload.timeMinutes !== undefined && payload.timeMinutes !== null) {
      formData.append('timeMinutes', String(payload.timeMinutes));
    }

    if (payload.timeMinutes === null) {
      formData.append('timeMinutes', '');
    }

    if (payload.difficulty !== undefined) {
      formData.append('difficulty', payload.difficulty);
    }

    if (payload.tags !== undefined) {
      formData.append('tags', payload.tags);
    }

    if (payload.photo) {
      formData.append('photos', payload.photo);
    }

    return formData;
  }
}