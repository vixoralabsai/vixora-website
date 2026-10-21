import {
  ShieldCheck,
  Zap,
  Code2,
  Cpu,
  Layers,
  Users2,
  CheckCircle2,
  Lock
} from 'lucide-react';

export function WhyVixora() {
  const pillars = [
    {
      title: "Engineered Like Enterprise Tech, Not an Agency",
      desc: "We write clean, typed, modular codebases with automated CI/CD and zero vendor lock-in. You own 100% of your source code and infrastructure.",
      icon: Code2,
      badge: "Architecture"
    },
    {
      title: "Real Autonomous AI & LLM Systems",
      desc: "Beyond simple wrapper apps, we build production agent swarms, vector retrieval pipelines (RAG), and resilient n8n automation backends.",
      icon: Cpu,
      badge: "AI Native"
    },
    {
      title: "Full-Lifecycle Execution Under One Roof",
      desc: "From initial SRS specification to Figma design, FastAPI engineering, media production, and team training in Vixora Academy.",
      icon: Layers,
      badge: "End-to-End"
    },
    {
      title: "Zero-Trust Security & High Availability",
      desc: "HIPAA-grade data segregation, server-side secret isolation, automated backups, and 99.98% containerized SLA deployments.",
      icon: ShieldCheck,
      badge: "Security"
    }
  ];

  return (
    <section className="py-24 bg-neutral-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20">
              <span>WHY VIXORA DIGITAL HUB</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-100 tracking-tight leading-tight">
              The Digital Headquarters for Smarter Business Growth
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
              Most businesses struggle with disjointed freelancers, slow agencies, and brittle tools. Vixora Digital Hub operates as your dedicated engineering and innovation powerhouse, delivering battle-tested software and high-ROI automation.
            </p>

            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-3 text-sm text-neutral-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Transparent fixed milestones & clear SRS roadmaps</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Dedicated full-stack engineering & AI architect lead</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Post-launch warranty & ongoing 24/7 reliability support</span>
              </div>
            </div>
          </div>

          {/* Right Column: 4 Strategic Pillars */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {pillars.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-850 hover:border-neutral-700 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-blue-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase font-semibold text-neutral-400 px-2 py-0.5 rounded bg-neutral-800">
                      {p.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
