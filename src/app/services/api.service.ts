import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PingResponse {
  ok: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ping(): Observable<PingResponse> {
    return this.http.get<PingResponse>(`${this.baseUrl}/api/ping`);
  }
}
