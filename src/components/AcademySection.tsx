import { useState } from 'react';
import { CheckCircle2, ArrowRight, Award } from 'lucide-react';
import { WhatsAppContactButton } from './WhatsAppContactButton';

interface AcademySectionProps {
  onOpenProjectModal: () => void;
}

export function AcademySection({ onOpenProjectModal }: AcademySectionProps) {
  const [selectedTrack, setSelectedTrack] = useState<'academy' | 'corporate' | 'masterclass'>('academy');

  const tracks = [
    {
      id: 'academy',
      title: 'Vixora Academy Cohort',
      subtitle: '12-Week Intensive Full-Stack & AI Engineering',
      target: 'Aspiring Builders & Senior Devs',
      topics: [
        'Advanced Python, FastAPI & Asynchronous Architectures',
        'Next.js 15, React 19 & High-Performance Frontends',
        'Autonomous AI Agents, n8n Orchestration & LangChain',
        'PostgreSQL, pgvector & Vector Search Pipelines',
        'Docker, AWS Cloud Run & Production CI/CD'
      ],
      deliverable: 'Capstoned Real-World Production App + Vixora Certified Credential'
    },
    {
      id: 'corporate',
      title: 'Corporate AI & Automation Upskilling',
      subtitle: 'Custom Workforce Transformation for Enterprises & SMEs',
      target: 'Company Teams, Operations & Executives',
      topics: [
        'Executive AI Strategy, Governance & Security Compliance',
        'No-Code/Low-Code Workflow Automation (n8n & Zapier)',
        'Prompt Engineering & Custom GPTs for Internal Operations',
        'Automated Customer Support & CRM Integrations',
        'Document Parsing & Financial Reporting Pipelines'
      ],
      deliverable: 'Custom Corporate LMS Modules + Hands-on Departmental Labs'
    },
    {
      id: 'masterclass',
      title: 'Technical Masterclasses & Workshops',
      subtitle: 'Focused Single-Day Deep Dives on Emerging Tech',
      target: 'Engineers, Product Managers & Founders',
      topics: [
        'Building Multi-Agent Swarms with Tool Calling',
        'Fine-Tuning LLMs on Proprietary Business Knowledge',
        'High-Converting UGC & AI Video Ad Generation',
        'Zero-Downtime Deployment & Cloud Observability'
      ],
      deliverable: 'Live Code Sandbox, Architecture Blueprints & Replay Library'
    }
  ];

  const currentTrack = tracks.find((t) => t.id === selectedTrack) || tracks[0];

  return (
    <section id="academy" className="py-24 bg-[#F7F7FC] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-medium text-[#480878] bg-[#480878]/5 border border-[#480878]/15 mb-3">
            <span>EDUCATION & TALENT ENGINE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#000048] tracking-tight">
            Vixora Academy & Corporate Training
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#5F6078] font-normal">
            Bridging the global tech talent gap by training developers and corporate teams in modern software architecture, LLM systems, and automated operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10">
          {tracks.map((t) => {
            const isSelected = t.id === selectedTrack;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTrack(t.id as 'academy' | 'corporate' | 'masterclass')}
                className={`p-5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#480878]/10 border-[#9030F8]/60 shadow-lg shadow-[#480878]/10'
                    : 'bg-white border-[#E5E5F0] hover:border-[#9030F8]/40 hover:bg-[#F7F7FC]'
                }`}
              >
                <div>
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded uppercase ${
                    isSelected ? 'bg-[#480878] text-white' : 'bg-[#F7F7FC] text-[#5F6078] border border-[#E5E5F0]'
                  }`}>
                    {t.target}
                  </span>
                  <h3 className={`text-base font-bold mt-2.5 ${isSelected ? 'text-[#480878]' : 'text-[#000048]'}`}>
                    {t.title}
                  </h3>
                </div>
                <p className="text-xs text-[#5F6078] mt-2 line-clamp-2">{t.subtitle}</p>
              </button>
            );
          })}
        </div>

        <div className="p-7 sm:p-9 rounded-2xl bg-white border border-[#E5E5F0] shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-mono text-[#7000F8] uppercase font-semibold">Course Architecture</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#000048] mt-1">{currentTrack.title}</h3>
                <p className="text-sm text-[#5F6078] mt-1">{currentTrack.subtitle}</p>
              </div>

              <div className="space-y-2.5">
                <p className="text-xs font-mono uppercase text-[#5F6078] tracking-wider">Curriculum Highlights:</p>
                {currentTrack.topics.map((top, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#000048]">
                    <CheckCircle2 className="w-4 h-4 text-[#9030F8] shrink-0 mt-0.5" />
                    <span>{top}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-[#F7F7FC] border border-[#E5E5F0] text-xs text-[#5F6078] flex items-center gap-3">
                <Award className="w-5 h-5 text-[#7000F8] shrink-0" />
                <div>
                  <strong className="text-[#000048] block font-medium">Certification & Capstone:</strong>
                  {currentTrack.deliverable}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 p-6 rounded-xl bg-[#F7F7FC] border border-[#E5E5F0] space-y-5">
              <div className="space-y-1">
                <h4 className="text-base font-bold text-[#000048]">Next Cohort Registration</h4>
                <p className="text-xs text-[#5F6078]">Applications are reviewed on a rolling basis. Small cohort sizes for hands-on mentorship.</p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs py-2 border-b border-[#E5E5F0]">
                  <span className="text-[#5F6078]">Format</span>
                  <span className="font-semibold text-[#000048]">Live Virtual + Code Lab</span>
                </div>
                <div className="flex items-center justify-between text-xs py-2 border-b border-[#E5E5F0]">
                  <span className="text-[#5F6078]">Mentorship</span>
                  <span className="font-semibold text-[#000048]">1-on-1 Senior Staff Engineers</span>
                </div>
                <div className="flex items-center justify-between text-xs py-2 border-b border-[#E5E5F0]">
                  <span className="text-[#5F6078]">Prerequisites</span>
                  <span className="font-semibold text-[#000048]">Basic Programming / Logic</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  onClick={onOpenProjectModal}
                  className="w-full py-3 rounded-xl text-xs font-semibold bg-[#480878] hover:bg-[#7000F8] text-white shadow-md shadow-[#480878]/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>Apply for Enrollment / Corporate Booking</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <WhatsAppContactButton
                  variant="secondary"
                  label="Chat with Academy Advisor (US & Nigeria)"
                  message="Hello Vixora Academy Admissions, I have a question about course cohorts and syllabus tracks."
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
