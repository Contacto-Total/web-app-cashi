export interface Portfolio {
  id: number;
  portfolioCode: string;
  portfolioName: string;
  portfolioType: string;
  parentPortfolioId?: number;
  hierarchyLevel: number;
  description?: string;
  isActive: boolean;
}
