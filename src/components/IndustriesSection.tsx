import { useState } from 'react';
import {
  HeartPulse, GraduationCap, Building2, ShoppingBag, Utensils, Globe2,
  Church, Landmark, Briefcase, Rocket, CheckCircle2, ArrowUpRight
} from 'lucide-react';
import { INDUSTRIES, IndustrySpec } from '../data/vixoraContent';

interface IndustriesSectionProps {
  onSelectIndustry?: (industry: string) => void;
}

export function IndustriesSection({ onSelectIndustry }: IndustriesSectionProps) {
  const [selectedId, setSelectedId] = useState<string>('healthcare');
  const activeInd = INDUSTRIES.find((i) => i.id === selectedId) || INDUSTRIES[0];

  const getIndustryIcon = (iconName: string) => {
    switch (iconName) {
      case 'HeartPulse': return <HeartPulse className="w-5 h-5 text-[#480878]" />;
      case 'GraduationCap': return <GraduationCap className="w-5 h-5 text-[#7000F8]" />;
      case 'Building2': return <Building2 className="w-5 h-5 text-[#480878]" />;
      case 'ShoppingBag': return <ShoppingBag className="w-5 h-5 text-[#9030F8]" />;
      case 'Utensils': return <Utensils className="w-5 h-5 text-[#7000F8]" />;
      case 'Globe2': return <Globe2 className="w-5 h-5 text-[#480878]" />;
      case 'Church': return <Church className="w-5 h-5 text-[#9030F8]" />;
      case 'Landmark': return <Landmark className="w-5 h-5 text-[#480878]" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5 text-[#7000F8]" />;
      case 'Rocket': return <Rocket className="w-5 h-5 text-[#9030F8]" />;
      default: return <Briefcase className="w-5 h-5 text-[#480878]" />;
    }
  };

  return (
    <section id="industries" className="py-24 bg-[#F7F7FC] border-t border-[#E5E5F0] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-medium text-[#480878] bg-[#480878]/5 border border-[#480878]/15 mb-3">
            <span>DOMAIN SPECIALIZATION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#000048] tracking-tight" style={{ color: '#000048' }}>Industries We Transform</h2>
          <p className="mt-3 text-base sm:text-lg text-[#5F6078] font-normal" style={{ color: '#475569' }}>
            Domain-specific digital solutions and AI workflows tailored to your sector's needs, customers, and market dynamics.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-2 gap-3">
            {INDUSTRIES.map((ind) => {
              const isSelected = ind.id === selectedId;
              return (
                <button
                  key={ind.id}
                  onClick={() => setSelectedId(ind.id)}
                  className={`p-4 rounded-xl text-left border transition-all flex items-start gap-3.5 group ${
                    isSelected
                      ? 'bg-white border-[#9030F8]/60 shadow-md shadow-[#480878]/10'
                      : 'bg-white border-[#E5E5F0] hover:border-[#9030F8]/40 hover:bg-[#F7F7FC]'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg shrink-0 transition-colors ${isSelected ? 'bg-[#480878]/10' : 'bg-[#F7F7FC]'}`}>
                    {getIndustryIcon(ind.icon)}
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold flex items-center gap-1.5 ${isSelected ? 'text-[#000048]' : 'text-[#000048]'}`}>
                      <span>{ind.name}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#9030F8]" />}
                    </h3>
                    <p className="text-[11px] text-[#5F6078] line-clamp-1 mt-0.5">{ind.impactMetric}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-5 sticky top-28">
            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#E5E5F0] shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E5F0]">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-[#F7F7FC] border border-[#E5E5F0]">{getIndustryIcon(activeInd.icon)}</div>
                  <div>
                    <h4 className="text-xl font-bold text-[#000048]">{activeInd.name}</h4>
                    <span className="text-xs font-mono text-[#480878]">Impact: {activeInd.impactMetric}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-mono text-[#5F6078] uppercase tracking-wider mb-1.5">Sector Overview</p>
                <p className="text-sm text-[#5F6078] leading-relaxed">{activeInd.summary}</p>
              </div>

              <div>
                <p className="text-xs font-mono text-[#5F6078] uppercase tracking-wider mb-2.5">Engineered Use Cases</p>
                <div className="space-y-2">
                  {activeInd.useCases.map((uc, uIdx) => (
                    <div key={uIdx} className="p-3 rounded-lg bg-[#F7F7FC] border border-[#E5E5F0] text-xs text-[#000048] flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#9030F8] shrink-0 mt-0.5" />
                      <span>{uc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E5F0] flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-[#5F6078]">PRIMARY STACK</span>
                  <p className="font-mono text-[#000048] font-semibold text-[11px]">{activeInd.techFocus}</p>
                </div>
                <a href="#contact" className="px-3 py-1.5 rounded-lg bg-[#480878] hover:bg-[#7000F8] text-white font-medium text-xs flex items-center gap-1 shadow-sm">
                  <span>Build For {activeInd.name.split(' ')[0]}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
