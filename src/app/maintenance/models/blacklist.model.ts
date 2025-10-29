export interface Blacklist {
  id?: number;
  customerId?: number;
  tenantId: number;
  tenantName: string;
  portfolioId?: number;
  portfolioName?: string;
  subPortfolioId?: number;
  subPortfolioName?: string;
  document?: string;
  email?: string;
  phone?: string;
  startDate: string;
  endDate: string;
}
