import { PORTFOLIO_PROJECTS, PortfolioProject } from './vixoraContent';

export type PortfolioProjectWithUrl = PortfolioProject & {
  liveUrl?: string;
};

export const PORTFOLIO_PROJECTS_WITH_ADDITIONS: PortfolioProjectWithUrl[] = [
  ...PORTFOLIO_PROJECTS,
  {
    id: 'subtle-traces-website',
    title: 'Subtle Traces Website',
    category: 'SaaS & Web',
    client: 'Subtle Traces',
    businessProblem: 'Website development project delivered for Subtle Traces.',
    solution: 'A branded web experience built to give the business a professional digital presence.',
    technologiesUsed: ['Web Development'],
    outcome: 'Live website',
    outcomeStats: 'LIVE',
    liveUrl: 'https://www.subtletraces.com/'
  },
  {
    id: 'omo-obas-ventures-website',
    title: 'Omo Obas Ventures Website',
    category: 'SaaS & Web',
    client: 'Omo Obas Ventures',
    businessProblem: 'Website development project delivered for Omo Obas Ventures.',
    solution: 'A branded web experience built to give the business a professional digital presence.',
    technologiesUsed: ['Web Development'],
    outcome: 'Live website',
    outcomeStats: 'LIVE',
    liveUrl: 'https://www.omoobasarumiventures.com/'
  }
];
