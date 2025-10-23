export interface Portfolio {
  id: number;
  tenantId: number;
  portfolioCode: string;
  portfolioName: string;
  description?: string;
  isActive: boolean;
  hasSubPortfolios: boolean;
}

export interface SubPortfolio {
  id: number;
  portfolioId: number;
  portfolioCode: string;
  portfolioName: string;
  subPortfolioCode: string;
  subPortfolioName: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePortfolioRequest {
  tenantId: number;
  portfolioCode: string;
  portfolioName: string;
  description?: string;
}

export interface UpdatePortfolioRequest {
  portfolioName?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateSubPortfolioRequest {
  portfolioId: number;
  subPortfolioCode: string;
  subPortfolioName: string;
  description?: string;
}

export interface UpdateSubPortfolioRequest {
  subPortfolioName?: string;
  description?: string;
  isActive?: boolean;
}
