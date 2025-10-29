import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Blacklist } from '../models/blacklist.model';

@Injectable({
  providedIn: 'root'
})
export class BlacklistService {
  private apiUrl = `${environment.apiUrl}/blacklist`;

  constructor(private http: HttpClient) {}

  getAllBlacklists(): Observable<Blacklist[]> {
    return this.http.get<Blacklist[]>(this.apiUrl);
  }

  getBlacklistById(id: number): Observable<Blacklist> {
    return this.http.get<Blacklist>(`${this.apiUrl}/${id}`);
  }

  getBlacklistsByTenant(tenantId: number): Observable<Blacklist[]> {
    return this.http.get<Blacklist[]>(`${this.apiUrl}/tenant/${tenantId}`);
  }

  createBlacklist(blacklist: Blacklist): Observable<Blacklist> {
    return this.http.post<Blacklist>(this.apiUrl, blacklist);
  }

  updateBlacklist(id: number, blacklist: Blacklist): Observable<Blacklist> {
    return this.http.put<Blacklist>(`${this.apiUrl}/${id}`, blacklist);
  }

  deleteBlacklist(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
