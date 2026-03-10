import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Listing,
  CreateListingPayload,
  UpdateListingPayload
} from '../../shared/models/listing.model';

@Injectable({
  providedIn: 'root'
})
export class ListingService {

  private apiUrl = `${environment.apiUrl}/listings`;

  constructor(private http: HttpClient) {}

  getAll(filters?: {
    search?: string;
    category?: string;
    postalCode?: string;
    status?: string;
  }): Observable<Listing[]> {

    let params = new HttpParams();

    if (filters?.search) {
      params = params.set('search', filters.search);
    }

    if (filters?.category) {
      params = params.set('category', filters.category);
    }

    if (filters?.postalCode) {
      params = params.set('postalCode', filters.postalCode);
    }

    if (filters?.status) {
      params = params.set('status', filters.status);
    }

    return this.http.get<Listing[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Listing> {
    return this.http.get<Listing>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateListingPayload): Observable<Listing> {
    const formData = this.buildCreateFormData(payload);
    return this.http.post<Listing>(this.apiUrl, formData);
  }

  update(id: number, payload: UpdateListingPayload): Observable<Listing> {
    return this.http.put<Listing>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private buildCreateFormData(payload: CreateListingPayload): FormData {
    const formData = new FormData();

    formData.append('title', payload.title);
    formData.append('category', payload.category);
    formData.append('postalCode', payload.postalCode);

    if (payload.description) {
      formData.append('description', payload.description);
    }

    if (payload.quantity) {
      formData.append('quantity', payload.quantity);
    }

    if (payload.expiryDate) {
      formData.append('expiryDate', payload.expiryDate);
    }

    if (payload.city) {
      formData.append('city', payload.city);
    }

    if (payload.pickupInfo) {
      formData.append('pickupInfo', payload.pickupInfo);
    }

    formData.append('photos', payload.photo);

    return formData;
  }
}