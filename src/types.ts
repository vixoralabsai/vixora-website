export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  iconLink?: string;
  modifiedTime?: string;
  size?: string;
  snippet?: string;
  extractedContent?: string;
  isSelected?: boolean;
  sourceType?: 'google_doc' | 'google_sheet' | 'text' | 'pdf' | 'markdown' | 'other' | 'sample';
}

export interface FunctionalRequirement {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low' | 'Critical';
  module: string;
  acceptanceCriteria: string[];
  isCompleted?: boolean;
}

export interface TechStackSpec {
  category: string;
  technology: string;
  versionOrDetail?: string;
  rationale?: string;
}

export interface ProjectMilestone {
  phase: string;
  title: string;
  targetTimeline?: string;
  keyDeliverables: string[];
}

export interface ProjectRequirementsDoc {
  projectName: string;
  summary: string;
  primaryObjective: string;
  targetAudience: string[];
  keyFeatures: string[];
  functionalRequirements: FunctionalRequirement[];
  techStack: TechStackSpec[];
  designAndUXGuidelines: string[];
  milestones: ProjectMilestone[];
  securityAndNonFunctional: string[];
  openQuestionsAndRisks: string[];
  rawMarkdownReport: string;
  analyzedAt: string;
  sourceFilesCount: number;
  sourceFilesSummary: { name: string; relevance: string }[];
}

export interface SearchState {
  isScanning: boolean;
  scanProgress: number;
  statusMessage: string;
  query: string;
  scannedCount: number;
  error: string | null;
}

export type ProjectStatusType =
  | 'Discovery & Scoping'
  | 'In Development'
  | 'In Review & QA'
  | 'Live in Production'
  | 'On Hold';

export type ProjectHealthType = 'On Track' | 'Ahead of Schedule' | 'Attention Needed';

export interface ProjectMilestoneItem {
  id: string;
  title: string;
  phase: string;
  dueDate: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  completedDate?: string;
  deliverables: string[];
  notes?: string;
}

export interface ProjectDeadline {
  id: string;
  title: string;
  date: string;
  daysRemaining: number;
  type: 'Sprint Review' | 'Deliverable Signoff' | 'Staging Deployment' | 'Live Launch' | 'Payment Milestone' | 'Security Audit';
  urgency: 'high' | 'normal' | 'low';
  assignedTo: string;
  description?: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  category: 'PRD & Specs' | 'UI/UX & Figma' | 'Architecture & Code' | 'Reports & QA' | 'Invoices & Legal';
  type: 'pdf' | 'doc' | 'figma' | 'code' | 'zip' | 'link';
  size?: string;
  uploadedAt: string;
  url: string;
  description?: string;
  isDriveLinked?: boolean;
}

export interface ProjectActivity {
  id: string;
  timestamp: string;
  author: string;
  avatarText: string;
  action: string;
  details?: string;
  category: 'deployment' | 'milestone' | 'document' | 'message' | 'ticket';
}

export interface ClientTicket {
  id: string;
  subject: string;
  category: 'Bug Report' | 'Feature Change' | 'Scope Adjustment' | 'Access & Infrastructure' | 'General Query';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Review' | 'In Progress' | 'Resolved';
  createdAt: string;
  description: string;
  response?: string;
}

export interface ClientProject {
  id: string;
  accessCode: string; // e.g. VX-84920
  clientName: string;
  clientEmail: string;
  company: string;
  projectName: string;
  tagline: string;
  status: ProjectStatusType;
  health: ProjectHealthType;
  progress: number; // 0 to 100
  startDate: string;
  targetDeliveryDate: string;
  budgetTier: string;
  services: string[];
  leadEngineer: {
    name: string;
    role: string;
    email: string;
    phoneWhatsApp: string;
  };
  projectManager: {
    name: string;
    role: string;
    email: string;
    phoneWhatsApp: string;
  };
  milestones: ProjectMilestoneItem[];
  upcomingDeadlines: ProjectDeadline[];
  files: ProjectFile[];
  activities: ProjectActivity[];
  tickets?: ClientTicket[];
  stagingUrl?: string;
  productionUrl?: string;
  repoUrl?: string;
  figmaUrl?: string;
  driveFolderUrl?: string;
  notes?: string;
}

