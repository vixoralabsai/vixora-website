import {
  Code2,
  Bot,
  Palette,
  Megaphone,
  Video,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { FEATURED_SERVICES, ServiceDetail } from '../data/vixoraContent';

interface FeaturedServicesProps {
  onOpenProjectModal: () => void;
}

export function FeaturedServices({ onOpenProjectModal }: FeaturedServicesProps) {
  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code2': return <Code2 className="w-6 h-6 text-[#480878]" />;
      case 'Bot': return <Bot className="w-6 h-6 text-[#9030F8]" />;
      case 'Palette': return <Palette className="w-6 h-6 text-[#7000F8]" />;
      case 'Megaphone': return <Megaphone className="w-6 h-6 text-[#480878]" />;
      case 'Video': return <Video className="w-6 h-6 text-[#9030F8]" />;
      case 'GraduationCap': return <GraduationCap className="w-6 h-6 text-[#7000F8]" />;
      default: return <Sparkles className="w-6 h-6 text-[#9030F8]" />;
    }
  };

  return (
    <section id="services" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-medium text-[#480878] bg-[#480878]/5 border border-[#480878]/15 mb-3">
            <span>FULL-SPECTRUM SERVICES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#000048] tracking-tight">
            Featured Capabilities & Services
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#5F6078] font-normal">
            Specialized software, AI automation, creative media, performance growth, and training tailored to your business stage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_SERVICES.map((srv) => (
            <div
              key={srv.id}
              className="p-7 rounded-2xl bg-white border border-[#E5E5F0] hover:border-[#9030F8]/40 transition-all flex flex-col justify-between group hover:bg-[#F7F7FC] hover:shadow-xl hover:shadow-[#000048]/5"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-[#F7F7FC] border border-[#E5E5F0]">
                    {getServiceIcon(srv.icon)}
                  </div>
                  <span className="text-[10px] font-mono text-[#5F6078] px-2.5 py-0.5 rounded-full bg-[#F7F7FC] border border-[#E5E5F0]">
                    {srv.subtitle}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#000048] mb-1 group-hover:text-[#480878] transition-colors">
                  {srv.title}
                </h3>
                <p className="text-xs font-medium text-[#480878] mb-3">
                  "{srv.tagline}"
                </p>

                <p className="text-xs sm:text-sm text-[#5F6078] leading-relaxed mb-6">
                  {srv.description}
                </p>

                <div className="space-y-2.5 pt-4 border-t border-[#E5E5F0]">
                  {srv.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs text-[#000048]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#9030F8] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#E5E5F0]">
                <button
                  onClick={onOpenProjectModal}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[#000048] hover:bg-[#480878] text-white border border-[#000048] hover:border-[#480878] transition-all flex items-center justify-center gap-2"
                >
                  <span>Inquire for {srv.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C7A0FF]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
