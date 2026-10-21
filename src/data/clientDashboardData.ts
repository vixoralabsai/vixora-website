import { ClientProject } from '../types';

export const INITIAL_CLIENT_PROJECTS: ClientProject[] = [
  {
    id: 'proj-apex-health-ai',
    accessCode: 'VX-84920',
    clientName: 'Dr. Sarah Jenkins',
    clientEmail: 's.jenkins@apexhealth.io',
    company: 'Apex Health Systems',
    projectName: 'Apex AI Clinical Workflow & Triaging Agent',
    tagline: 'HIPAA-compliant autonomous patient triage & medical transcription agent pipeline.',
    status: 'In Development',
    health: 'On Track',
    progress: 72,
    startDate: 'January 12, 2026',
    targetDeliveryDate: 'April 28, 2026',
    budgetTier: '$25,000 - $40,000 (Enterprise Pod)',
    services: ['AI Automation & Agents', 'Software Development', 'SaaS Product Architecture'],
    leadEngineer: {
      name: 'Engr. Alex Vance',
      role: 'Principal AI Systems Architect',
      email: 'alex.vance@vixorahub.com',
      phoneWhatsApp: '18128036248'
    },
    projectManager: {
      name: 'Clara Hughes',
      role: 'Senior Technical Project Lead',
      email: 'clara.hughes@vixorahub.com',
      phoneWhatsApp: '2348114542934'
    },
    stagingUrl: 'https://staging-apex-health.vixora.app',
    repoUrl: 'https://github.com/vixora-digital/apex-health-ai-core',
    figmaUrl: 'https://figma.com/@vixora/apex-clinical-ds-v3',
    driveFolderUrl: 'https://drive.google.com/drive/folders/vixora-apex-health-secure',
    notes: 'Sprint 5 is currently focused on optimizing Whisper-v3 fine-tuning latency and multi-tenant EHR webhook listeners.',
    milestones: [
      {
        id: 'ms-1',
        phase: 'Phase 1',
        title: 'Discovery, Security Architecture & PRD Sign-off',
        dueDate: 'Jan 26, 2026',
        status: 'completed',
        completedDate: 'Jan 24, 2026',
        deliverables: [
          'Full Architectural PRD Document',
          'HIPAA Compliance Security Matrix',
          'Database Schema & Multi-Tenant Partitioning Model'
        ],
        notes: 'Signed off by Chief Medical Officer and IT Security Lead.'
      },
      {
        id: 'ms-2',
        phase: 'Phase 2',
        title: 'UI/UX Design System & Interactive Clinical Prototypes',
        dueDate: 'Feb 15, 2026',
        status: 'completed',
        completedDate: 'Feb 14, 2026',
        deliverables: [
          'Figma Design System (Light/Dark High-Contrast Mode)',
          'Nurse Triaging Mobile Tablet Interface',
          'Doctor Diagnostic Summary Review Board'
        ],
        notes: 'User testing completed with 14 clinicians across 3 departments.'
      },
      {
        id: 'ms-3',
        phase: 'Phase 3',
        title: 'Core AI Agent Swarm & Transcription Pipeline',
        dueDate: 'March 20, 2026',
        status: 'in_progress',
        deliverables: [
          'Real-time Audio Streaming Transcription Service',
          'LLM Clinical Extraction & SOAP Notes Generator',
          'FastAPI Microservices with Redis Queue Cache'
        ],
        notes: '94% of unit tests passing. Load testing scheduled for next Tuesday.'
      },
      {
        id: 'ms-4',
        phase: 'Phase 4',
        title: 'EHR Integrations & Sandbox Staging Testing',
        dueDate: 'April 10, 2026',
        status: 'upcoming',
        deliverables: [
          'HL7 / FHIR API bidirectional sync bridge',
          'Staging Penetration Testing & Vulnerability Audit',
          'Role-Based Access Control (RBAC) verification'
        ]
      },
      {
        id: 'ms-5',
        phase: 'Phase 5',
        title: 'Production Cutover, Staff Training & 90-Day Hypercare',
        dueDate: 'April 28, 2026',
        status: 'upcoming',
        deliverables: [
          'Cloud Run / Kubernetes Zero-Downtime Cluster Deployment',
          'Staff Onboarding Video Tutorials & PDF SOPs',
          '24/7 Dedicated Ops Monitoring Dashboard'
        ]
      }
    ],
    upcomingDeadlines: [
      {
        id: 'dl-1',
        title: 'Sprint 5 Live Demo & Transcription Accuracy Benchmark',
        date: 'March 14, 2026',
        daysRemaining: 10,
        type: 'Sprint Review',
        urgency: 'high',
        assignedTo: 'Engr. Alex Vance & Clara Hughes',
        description: 'Review live latency metrics and clinician feedback on automated SOAP note summaries.'
      },
      {
        id: 'dl-2',
        title: 'FHIR Sandbox Connector Security Clearance',
        date: 'March 25, 2026',
        daysRemaining: 21,
        type: 'Security Audit',
        urgency: 'normal',
        assignedTo: 'Vixora Security Engineering Pod',
        description: 'Execute end-to-end payload encryption validation for external hospital endpoints.'
      },
      {
        id: 'dl-3',
        title: 'Milestone 4 Staging Deployment Checkpoint',
        date: 'April 10, 2026',
        daysRemaining: 37,
        type: 'Staging Deployment',
        urgency: 'normal',
        assignedTo: 'DevOps & QA Team',
        description: 'Complete staging environment deployment with synthetic patient workloads.'
      }
    ],
    files: [
      {
        id: 'file-1',
        name: 'Apex_AI_Architecture_Master_PRD_v2.4.pdf',
        category: 'PRD & Specs',
        type: 'pdf',
        size: '3.8 MB',
        uploadedAt: 'Feb 20, 2026',
        url: '#',
        description: 'Official System Blueprint with technical schemas, endpoint specs, and security protocols.',
        isDriveLinked: true
      },
      {
        id: 'file-2',
        name: 'Figma Design System & Clinical UI Prototype',
        category: 'UI/UX & Figma',
        type: 'figma',
        size: 'Figma Cloud File',
        uploadedAt: 'Feb 15, 2026',
        url: 'https://figma.com/@vixora/apex-clinical-ds-v3',
        description: 'All responsive layouts for clinical tablets, desktop dashboards, and patient cards.'
      },
      {
        id: 'file-3',
        name: 'HIPAA_Compliance_Audit_Matrix.pdf',
        category: 'Reports & QA',
        type: 'pdf',
        size: '1.2 MB',
        uploadedAt: 'Jan 28, 2026',
        url: '#',
        description: 'Third-party encryption at rest, in transit, and BAA documentation report.'
      },
      {
        id: 'file-4',
        name: 'Vixora_Services_Contract_&_IP_Assignment.pdf',
        category: 'Invoices & Legal',
        type: 'pdf',
        size: '840 KB',
        uploadedAt: 'Jan 12, 2026',
        url: '#',
        description: 'Fully executed Master Services Agreement with 100% intellectual property transfer.'
      },
      {
        id: 'file-5',
        name: 'OpenAPI_Swagger_Specification_v1.json',
        category: 'Architecture & Code',
        type: 'code',
        size: '420 KB',
        uploadedAt: 'Feb 28, 2026',
        url: '#',
        description: 'Machine-readable REST & WebSocket API specification for internal engineering teams.'
      }
    ],
    activities: [
      {
        id: 'act-1',
        timestamp: '2 hours ago',
        author: 'Alex Vance',
        avatarText: 'AV',
        action: 'Deployed Build v0.8.4 to Staging Environment',
        details: 'Added streaming transcription audio chunking with latency reduced to 180ms.',
        category: 'deployment'
      },
      {
        id: 'act-2',
        timestamp: 'Yesterday at 4:30 PM',
        author: 'Clara Hughes',
        avatarText: 'CH',
        action: 'Updated Sprint 5 Milestone Deliverables',
        details: 'Completed SOAP note custom tag parser. Testing across 12 clinical specialty templates.',
        category: 'milestone'
      },
      {
        id: 'act-3',
        timestamp: 'Feb 28, 2026',
        author: 'DevOps Swarm',
        avatarText: 'DS',
        action: 'Uploaded OpenAPI Swagger Specification v1',
        details: 'Synchronized REST endpoints with backend FastAPI routing tables.',
        category: 'document'
      },
      {
        id: 'act-4',
        timestamp: 'Feb 24, 2026',
        author: 'Dr. Sarah Jenkins',
        avatarText: 'SJ',
        action: 'Approved UI/UX Clinical Prototype Milestone',
        details: 'Signed off on tablet touch layout for emergency department triaging nurses.',
        category: 'message'
      }
    ],
    tickets: [
      {
        id: 'tkt-101',
        subject: 'Add emergency cardiology code keywords to instant alert queue',
        category: 'Feature Change',
        priority: 'High',
        status: 'In Progress',
        createdAt: 'March 1, 2026',
        description: 'Please ensure that when transcription detects STEMI or ventricular fibrillation symptoms, an immediate high-priority banner triggers in the doctor triage view.',
        response: 'Acknowledged by Alex Vance. Rule logic added to NLP keyword filter; test coverage underway.'
      }
    ]
  },
  {
    id: 'proj-lumina-pay-gateway',
    accessCode: 'VX-51049',
    clientName: 'Marcus Sterling',
    clientEmail: 'm.sterling@luminapay.co',
    company: 'LuminaPay Global Ltd',
    projectName: 'Lumina Cross-Border Multi-Currency Payment Engine',
    tagline: 'High-throughput payment gateway supporting USD, EUR, NGN, KES, and instant settlement.',
    status: 'In Review & QA',
    health: 'Ahead of Schedule',
    progress: 88,
    startDate: 'November 18, 2025',
    targetDeliveryDate: 'March 30, 2026',
    budgetTier: '$35,000+ (Full Multi-Tenant System)',
    services: ['Software Development', 'SaaS Product Architecture', 'Branding & UI/UX Design'],
    leadEngineer: {
      name: 'Tariq Al-Mansoor',
      role: 'Principal Fintech Core Architect',
      email: 'tariq@vixorahub.com',
      phoneWhatsApp: '18128036248'
    },
    projectManager: {
      name: 'Elena Rostova',
      role: 'Fintech Delivery Director',
      email: 'elena@vixorahub.com',
      phoneWhatsApp: '2348114542934'
    },
    stagingUrl: 'https://staging.luminapay.network',
    repoUrl: 'https://github.com/vixora-digital/lumina-settlement-engine',
    figmaUrl: 'https://figma.com/@vixora/lumina-checkout-v4',
    driveFolderUrl: 'https://drive.google.com/drive/folders/vixora-lumina-fintech',
    notes: 'PCI-DSS Level 1 vulnerability scans completed with 0 critical findings. Final regulatory sandbox validation underway.',
    milestones: [
      {
        id: 'ms-l1',
        phase: 'Phase 1',
        title: 'Fintech Architecture & Ledger Design',
        dueDate: 'Dec 10, 2025',
        status: 'completed',
        completedDate: 'Dec 08, 2025',
        deliverables: ['Double-Entry Ledger Schema', 'FX Rate Stream Pipeline', 'Security Whitepaper']
      },
      {
        id: 'ms-l2',
        phase: 'Phase 2',
        title: 'Multi-Currency Settlement Engine & Webhook Dispatchers',
        dueDate: 'Jan 20, 2026',
        status: 'completed',
        completedDate: 'Jan 18, 2026',
        deliverables: ['Automated FX Conversions', 'Idempotent Webhooks Engine', 'API SDK for Python & Node.js']
      },
      {
        id: 'ms-l3',
        phase: 'Phase 3',
        title: 'Merchant Analytics Portal & Checkout Embeds',
        dueDate: 'Feb 25, 2026',
        status: 'completed',
        completedDate: 'Feb 22, 2026',
        deliverables: ['Next.js Merchant Dashboard', 'Drop-in React Checkout Modal', 'Virtual Card Issuing API']
      },
      {
        id: 'ms-l4',
        phase: 'Phase 4',
        title: 'Security Audits, Penetration Testing & Regulatory Demo',
        dueDate: 'March 18, 2026',
        status: 'in_progress',
        deliverables: ['PCI-DSS Compliance Report', 'Load Testing (10k req/sec)', 'Disaster Recovery Failover Plan']
      },
      {
        id: 'ms-l5',
        phase: 'Phase 5',
        title: 'Production Live Cutover & Global Launch',
        dueDate: 'March 30, 2026',
        status: 'upcoming',
        deliverables: ['Multi-Region Cloud Run Deployments', 'Live Monitoring on Datadog', 'Merchant Onboarding Portal']
      }
    ],
    upcomingDeadlines: [
      {
        id: 'dl-l1',
        title: 'PCI-DSS Penetration Testing Final Sign-off',
        date: 'March 15, 2026',
        daysRemaining: 11,
        type: 'Security Audit',
        urgency: 'high',
        assignedTo: 'Security Review Board',
        description: 'Verify remediation of all low-level telemetry headers and verify KMS key rotations.'
      },
      {
        id: 'dl-l2',
        title: 'Production Cutover Readiness Review',
        date: 'March 28, 2026',
        daysRemaining: 24,
        type: 'Live Launch',
        urgency: 'high',
        assignedTo: 'Elena Rostova & Tariq Al-Mansoor',
        description: 'Final boardroom presentation with LuminaPay executive committee.'
      }
    ],
    files: [
      {
        id: 'f-l1',
        name: 'LuminaPay_Core_Ledger_Specification.pdf',
        category: 'PRD & Specs',
        type: 'pdf',
        size: '4.2 MB',
        uploadedAt: 'Dec 10, 2025',
        url: '#',
        description: 'Complete double-entry accounting schema with ACID transactional guarantees.'
      },
      {
        id: 'f-l2',
        name: 'Merchant_Portal_Figma_Design_Kit',
        category: 'UI/UX & Figma',
        type: 'figma',
        size: 'Figma Cloud File',
        uploadedAt: 'Feb 10, 2026',
        url: 'https://figma.com/@vixora/lumina-checkout-v4',
        description: 'High-conversion checkout frames and merchant analytics dashboard.'
      },
      {
        id: 'f-l3',
        name: 'PCI_DSS_Level_1_Pre_Assessment_Report.pdf',
        category: 'Reports & QA',
        type: 'pdf',
        size: '2.1 MB',
        uploadedAt: 'Feb 26, 2026',
        url: '#',
        description: 'Official external pentest and compliance validation checklist.'
      }
    ],
    activities: [
      {
        id: 'act-l1',
        timestamp: '3 hours ago',
        author: 'Tariq Al-Mansoor',
        avatarText: 'TA',
        action: 'Passed High-Concurrency Stress Test (12,400 tx/sec)',
        details: 'Zero transaction loss under simulated peak Black Friday volume spikes.',
        category: 'deployment'
      },
      {
        id: 'act-l2',
        timestamp: 'March 02, 2026',
        author: 'Elena Rostova',
        avatarText: 'ER',
        action: 'Completed Phase 3 Deliverable Sign-off',
        details: 'Merchant portal accepted and staging keys dispatched to pilot merchants.',
        category: 'milestone'
      }
    ]
  },
  {
    id: 'proj-novu-logistics-swarm',
    accessCode: 'VX-39218',
    clientName: 'Amara Okafor',
    clientEmail: 'amara@novulogistics.com',
    company: 'Novu Logistics Africa',
    projectName: 'Novu Autonomous Dispatch & Route Optimization Swarm',
    tagline: 'AI routing engine cutting fuel expenditure by 34% across 850+ fleet vehicles.',
    status: 'Live in Production',
    health: 'On Track',
    progress: 100,
    startDate: 'August 10, 2025',
    targetDeliveryDate: 'January 15, 2026',
    budgetTier: '$15,000 - $35,000 (Enterprise System)',
    services: ['AI Automation & Agents', 'Software Development', 'Media Buying & UGC Ads'],
    leadEngineer: {
      name: 'David Kalu',
      role: 'Senior Mobility & Optimization Engineer',
      email: 'david@vixorahub.com',
      phoneWhatsApp: '2348114542934'
    },
    projectManager: {
      name: 'Michael Chen',
      role: 'Operations Delivery Lead',
      email: 'mchen@vixorahub.com',
      phoneWhatsApp: '18128036248'
    },
    stagingUrl: 'https://staging.novu.vixora.app',
    productionUrl: 'https://dispatch.novulogistics.com',
    repoUrl: 'https://github.com/vixora-digital/novu-routing-swarm',
    figmaUrl: 'https://figma.com/@vixora/novu-driver-mobile',
    driveFolderUrl: 'https://drive.google.com/drive/folders/vixora-novu-logistics',
    notes: 'System is currently live and actively processing over 45,000 daily route waypoints across Lagos, Nairobi, and Johannesburg.',
    milestones: [
      {
        id: 'ms-n1',
        phase: 'Phase 1',
        title: 'Dispatch Algorithm Design & Fleet Telemetry Setup',
        dueDate: 'Sep 05, 2025',
        status: 'completed',
        completedDate: 'Sep 02, 2025',
        deliverables: ['Genetic Algorithm Route Solver', 'GPS Hardware Telemetry Gateway']
      },
      {
        id: 'ms-n2',
        phase: 'Phase 2',
        title: 'Driver Native Mobile App & Dispatcher Control Center',
        dueDate: 'Oct 30, 2025',
        status: 'completed',
        completedDate: 'Oct 28, 2025',
        deliverables: ['Android Driver App (Offline First)', 'Web Dispatcher Map Interface']
      },
      {
        id: 'ms-n3',
        phase: 'Phase 3',
        title: 'Live Pilot Deployment in Lagos Hub (50 Vehicles)',
        dueDate: 'Dec 01, 2025',
        status: 'completed',
        completedDate: 'Nov 27, 2025',
        deliverables: ['Live Fleet Validation', '34% Fuel Savings Verified on Field']
      },
      {
        id: 'ms-n4',
        phase: 'Phase 4',
        title: 'Full Continental Rollout & Retainer Support',
        dueDate: 'Jan 15, 2026',
        status: 'completed',
        completedDate: 'Jan 12, 2026',
        deliverables: ['850 Vehicles Onboarded', '24/7 SLA & Maintenance Retainer Active']
      }
    ],
    upcomingDeadlines: [
      {
        id: 'dl-n1',
        title: 'Q1 2026 System Performance & SLA Review',
        date: 'March 31, 2026',
        daysRemaining: 27,
        type: 'Sprint Review',
        urgency: 'low',
        assignedTo: 'David Kalu & Michael Chen',
        description: 'Quarterly review of telemetry uptime, cloud compute costs, and fleet scaling metrics.'
      }
    ],
    files: [
      {
        id: 'f-n1',
        name: 'Novu_Logistics_Final_Delivery_Report.pdf',
        category: 'Reports & QA',
        type: 'pdf',
        size: '5.1 MB',
        uploadedAt: 'Jan 15, 2026',
        url: '#',
        description: 'Full post-launch technical and economic impact audit report.'
      },
      {
        id: 'f-n2',
        name: 'Driver_Mobile_App_User_Manual_v2.pdf',
        category: 'PRD & Specs',
        type: 'pdf',
        size: '2.4 MB',
        uploadedAt: 'Jan 05, 2026',
        url: '#',
        description: 'Training guide for fleet drivers and logistics hub managers.'
      }
    ],
    activities: [
      {
        id: 'act-n1',
        timestamp: '1 day ago',
        author: 'David Kalu',
        avatarText: 'DK',
        action: 'Completed Monthly System Health Check',
        details: '99.98% uptime achieved across all dispatch clustering nodes.',
        category: 'deployment'
      }
    ]
  }
];
