import { ClientProject, ProjectFile, ProjectMilestoneItem, ClientTicket, ProjectActivity } from '../types';
import { INITIAL_CLIENT_PROJECTS } from '../data/clientDashboardData';

const LOCAL_STORAGE_KEY = 'vixora_client_projects_v1';
const ACTIVE_PROJECT_KEY = 'vixora_active_project_id';
const CLIENT_AUTH_SESSION_KEY = 'vixora_client_auth_session';

export interface ClientAuthSession {
  clientName: string;
  clientEmail: string;
  company?: string;
  accessCode?: string;
  authenticatedVia: 'google' | 'access_code' | 'email';
  loginTime: string;
}

// Helper to initialize local storage
export function getSavedClientProjects(): ClientProject[] {
  if (typeof window === 'undefined') return INITIAL_CLIENT_PROJECTS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_CLIENT_PROJECTS));
      return INITIAL_CLIENT_PROJECTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_CLIENT_PROJECTS;
  } catch (e) {
    console.error('Failed to load saved projects from localStorage:', e);
    return INITIAL_CLIENT_PROJECTS;
  }
}

export function saveClientProjects(projects: ClientProject[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to persist client projects:', e);
  }
}

export function getClientProjectById(projectId: string): ClientProject | undefined {
  const projects = getSavedClientProjects();
  return projects.find((p) => p.id === projectId);
}

export function getClientProjectsForUser(emailOrCode: string): ClientProject[] {
  const query = emailOrCode.trim().toLowerCase();
  if (!query) return [];
  const projects = getSavedClientProjects();
  return projects.filter(
    (p) =>
      p.clientEmail.toLowerCase() === query ||
      p.accessCode.toLowerCase() === query ||
      p.id.toLowerCase() === query ||
      p.company.toLowerCase().includes(query)
  );
}

// Create a new tracked client project from the Start Project consultation modal
export function createProjectFromConsultation(params: {
  clientName: string;
  clientEmail: string;
  company: string;
  phone?: string;
  services: string[];
  budgetRange: string;
  timeline: string;
  description: string;
}): ClientProject {
  const existingProjects = getSavedClientProjects();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const accessCode = `VX-${randomSuffix}`;
  const projectId = `proj-${Date.now().toString(36)}-${randomSuffix}`;

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 45); // default ~6 weeks

  const newProject: ClientProject = {
    id: projectId,
    accessCode,
    clientName: params.clientName || 'Valued Client',
    clientEmail: params.clientEmail || 'client@company.com',
    company: params.company || 'Enterprise Partner',
    projectName: `${params.company || params.clientName}'s ${params.services[0] || 'Digital Build'}`,
    tagline: params.description || `Custom ${params.services.join(', ')} platform engineered by Vixora.`,
    status: 'Discovery & Scoping',
    health: 'On Track',
    progress: 15,
    startDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    targetDeliveryDate: targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    budgetTier: params.budgetRange,
    services: params.services,
    leadEngineer: {
      name: 'Engr. Alex Vance',
      role: 'Principal Systems Architect',
      email: 'alex.vance@vixorahub.com',
      phoneWhatsApp: '18128036248'
    },
    projectManager: {
      name: 'Clara Hughes',
      role: 'Senior Technical Delivery Lead',
      email: 'clara.hughes@vixorahub.com',
      phoneWhatsApp: '2348114542934'
    },
    notes: `Initial consultation submitted. Scope: ${params.services.join(', ')}. Target timeline: ${params.timeline}.`,
    milestones: [
      {
        id: `ms-${Date.now()}-1`,
        phase: 'Phase 1',
        title: 'Strategy Consultation & Requirements Blueprint',
        dueDate: 'Next 5 Business Days',
        status: 'in_progress',
        deliverables: [
          'Initial System Architecture PRD',
          'Scope & Deliverable Sign-off Sheet',
          'Milestone Payment & Contract Execution'
        ],
        notes: 'Vixora Solutions Architect is reviewing your consultation brief.'
      },
      {
        id: `ms-${Date.now()}-2`,
        phase: 'Phase 2',
        title: 'UI/UX Design Systems & Interactive Prototypes',
        dueDate: 'Sprint 2',
        status: 'upcoming',
        deliverables: [
          'Figma Interactive Design System',
          'User Journey & Flow Diagrams'
        ]
      },
      {
        id: `ms-${Date.now()}-3`,
        phase: 'Phase 3',
        title: 'Core Development & API Integrations',
        dueDate: 'Sprint 4',
        status: 'upcoming',
        deliverables: [
          'Full-Stack Codebase Implementation',
          'Database Architecture & Agent Workflows'
        ]
      },
      {
        id: `ms-${Date.now()}-4`,
        phase: 'Phase 4',
        title: 'Staging QA & Production Launch',
        dueDate: 'Final Sprint',
        status: 'upcoming',
        deliverables: [
          'Live Staging Deployment & Penetration Testing',
          'Staff Training, Documentation & IP Transfer'
        ]
      }
    ],
    upcomingDeadlines: [
      {
        id: `dl-${Date.now()}-1`,
        title: 'Initial Architectural Review Call & Proposal',
        date: 'Within 24-48 Hours',
        daysRemaining: 2,
        type: 'Deliverable Signoff',
        urgency: 'high',
        assignedTo: 'Lead Systems Architect',
        description: 'Vixora team will present the high-level architecture and scope estimates.'
      }
    ],
    files: [
      {
        id: `file-${Date.now()}-1`,
        name: 'Project_Consultation_Brief.pdf',
        category: 'PRD & Specs',
        type: 'pdf',
        size: '120 KB',
        uploadedAt: 'Today',
        url: '#',
        description: 'Automated scoping summary captured from your initial request.'
      }
    ],
    activities: [
      {
        id: `act-${Date.now()}-1`,
        timestamp: 'Just now',
        author: 'Vixora Onboarding Bot',
        avatarText: 'VB',
        action: 'Consultation Successfully Logged',
        details: `Access Code ${accessCode} issued. Assigned to Clara Hughes for immediate review.`,
        category: 'milestone'
      }
    ]
  };

  const updated = [newProject, ...existingProjects];
  saveClientProjects(updated);
  setActiveProjectId(projectId);
  return newProject;
}

// Active Project ID helpers
export function getActiveProjectId(): string {
  if (typeof window === 'undefined') return INITIAL_CLIENT_PROJECTS[0].id;
  const saved = localStorage.getItem(ACTIVE_PROJECT_KEY);
  if (saved) return saved;
  return INITIAL_CLIENT_PROJECTS[0].id;
}

export function setActiveProjectId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACTIVE_PROJECT_KEY, id);
}

// Session Auth helpers
export function getClientAuthSession(): ClientAuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CLIENT_AUTH_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setClientAuthSession(session: ClientAuthSession | null): void {
  if (typeof window === 'undefined') return;
  if (!session) {
    localStorage.removeItem(CLIENT_AUTH_SESSION_KEY);
  } else {
    localStorage.setItem(CLIENT_AUTH_SESSION_KEY, JSON.stringify(session));
  }
}

// Milestone Toggle
export function toggleMilestoneStatus(projectId: string, milestoneId: string): ClientProject | null {
  const projects = getSavedClientProjects();
  const index = projects.findIndex((p) => p.id === projectId);
  if (index === -1) return null;

  const project = { ...projects[index] };
  project.milestones = project.milestones.map((m) => {
    if (m.id === milestoneId) {
      const nextStatus = m.status === 'completed' ? 'in_progress' : 'completed';
      return {
        ...m,
        status: nextStatus,
        completedDate: nextStatus === 'completed' ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined
      };
    }
    return m;
  });

  // recalculate progress
  const completedCount = project.milestones.filter((m) => m.status === 'completed').length;
  project.progress = Math.round((completedCount / project.milestones.length) * 100);

  // Add activity log
  const milestone = project.milestones.find((m) => m.id === milestoneId);
  project.activities = [
    {
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
      author: 'Client Lead',
      avatarText: 'CL',
      action: `Milestone status changed to ${milestone?.status === 'completed' ? 'Completed' : 'In Progress'}`,
      details: milestone?.title || '',
      category: 'milestone'
    },
    ...project.activities
  ];

  projects[index] = project;
  saveClientProjects(projects);
  return project;
}

// Submit a Client Ticket / Change Request
export function submitClientTicket(
  projectId: string,
  ticket: Omit<ClientTicket, 'id' | 'createdAt' | 'status'>
): ClientProject | null {
  const projects = getSavedClientProjects();
  const index = projects.findIndex((p) => p.id === projectId);
  if (index === -1) return null;

  const project = { ...projects[index] };
  const newTicket: ClientTicket = {
    ...ticket,
    id: `tkt-${Math.floor(100 + Math.random() * 900)}`,
    createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status: 'Open'
  };

  project.tickets = [newTicket, ...(project.tickets || [])];
  project.activities = [
    {
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
      author: project.clientName || 'Client',
      avatarText: 'CL',
      action: `Submitted Support Ticket #${newTicket.id}: ${newTicket.subject}`,
      details: `Priority: ${newTicket.priority} • Category: ${newTicket.category}`,
      category: 'ticket'
    },
    ...project.activities
  ];

  projects[index] = project;
  saveClientProjects(projects);
  return project;
}

// Add a file to a project
export function addFileToProject(projectId: string, file: Omit<ProjectFile, 'id' | 'uploadedAt'>): ClientProject | null {
  const projects = getSavedClientProjects();
  const index = projects.findIndex((p) => p.id === projectId);
  if (index === -1) return null;

  const project = { ...projects[index] };
  const newFile: ProjectFile = {
    ...file,
    id: `file-${Date.now()}`,
    uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };

  project.files = [newFile, ...project.files];
  project.activities = [
    {
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
      author: 'Workspace Sync',
      avatarText: 'WS',
      action: `Added file "${newFile.name}" to ${newFile.category}`,
      details: newFile.description || 'Uploaded asset attached to project repository.',
      category: 'document'
    },
    ...project.activities
  ];

  projects[index] = project;
  saveClientProjects(projects);
  return project;
}
