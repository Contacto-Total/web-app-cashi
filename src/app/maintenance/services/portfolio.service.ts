import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Portfolio,
  SubPortfolio,
  CreatePortfolioRequest,
  UpdatePortfolioRequest,
  CreateSubPortfolioRequest,
  UpdateSubPortfolioRequest
} from '../models/portfolio.model';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private apiUrl = `${environment.apiUrl}/system-config`;
  private subPortfolioUrl = `${environment.apiUrl}/subportfolios`;

  constructor(private http: HttpClient) {}

  // Portfolio endpoints
  getPortfoliosByTenant(tenantId: number): Observable<Portfolio[]> {
    return this.http.get<Portfolio[]>(`${this.apiUrl}/tenants/${tenantId}/portfolios`);
  }

  getPortfolioById(portfolioId: number): Observable<Portfolio> {
    return this.http.get<Portfolio>(`${this.apiUrl}/portfolios/${portfolioId}`);
  }

  createPortfolio(request: CreatePortfolioRequest): Observable<Portfolio> {
    return this.http.post<Portfolio>(`${this.apiUrl}/portfolios`, request);
  }

  updatePortfolio(portfolioId: number, request: UpdatePortfolioRequest): Observable<Portfolio> {
    return this.http.put<Portfolio>(`${this.apiUrl}/portfolios/${portfolioId}`, request);
  }

  deletePortfolio(portfolioId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/portfolios/${portfolioId}`);
  }

  // SubPortfolio endpoints
  getSubPortfoliosByPortfolio(portfolioId: number): Observable<SubPortfolio[]> {
    return this.http.get<SubPortfolio[]>(`${this.subPortfolioUrl}/by-portfolio/${portfolioId}`);
  }

  getActiveSubPortfoliosByPortfolio(portfolioId: number): Observable<SubPortfolio[]> {
    return this.http.get<SubPortfolio[]>(`${this.subPortfolioUrl}/by-portfolio/${portfolioId}/active`);
  }

  getSubPortfoliosByTenant(tenantId: number): Observable<SubPortfolio[]> {
    return this.http.get<SubPortfolio[]>(`${this.subPortfolioUrl}/by-tenant/${tenantId}`);
  }

  getAllSubPortfolios(): Observable<SubPortfolio[]> {
    return this.http.get<SubPortfolio[]>(this.subPortfolioUrl);
  }

  getSubPortfolioById(subPortfolioId: number): Observable<SubPortfolio> {
    return this.http.get<SubPortfolio>(`${this.subPortfolioUrl}/${subPortfolioId}`);
  }

  createSubPortfolio(request: CreateSubPortfolioRequest): Observable<SubPortfolio> {
    return this.http.post<SubPortfolio>(this.subPortfolioUrl, request);
  }

  updateSubPortfolio(subPortfolioId: number, request: UpdateSubPortfolioRequest): Observable<SubPortfolio> {
    return this.http.put<SubPortfolio>(`${this.subPortfolioUrl}/${subPortfolioId}`, request);
  }

  toggleSubPortfolioStatus(subPortfolioId: number, isActive: boolean): Observable<SubPortfolio> {
    return this.http.patch<SubPortfolio>(`${this.subPortfolioUrl}/${subPortfolioId}/toggle-status?isActive=${isActive}`, {});
  }

  deleteSubPortfolio(subPortfolioId: number): Observable<void> {
    return this.http.delete<void>(`${this.subPortfolioUrl}/${subPortfolioId}`);
  }
}
