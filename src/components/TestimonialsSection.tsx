import { TESTIMONIALS } from '../data/vixoraContent';
import { Star } from 'lucide-react';

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-white border-t border-[#E5E5F0] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-medium text-[#480878] bg-[#480878]/5 border border-[#480878]/15 mb-3">
            <span>CLIENT PERSPECTIVES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#000048] tracking-tight" style={{ color: '#000048' }}>What Leaders Say About Vixora</h2>
          <p className="mt-2 text-sm sm:text-base text-[#5F6078]" style={{ color: '#475569' }}>Real feedback from brand founders, consumer goods executives, and automotive leaders we partner with.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.id} className="p-7 rounded-2xl bg-white border border-[#E5E5F0] flex flex-col justify-between space-y-6 shadow-lg relative group hover:border-[#9030F8]/40 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#7000F8]">
                    {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-[#7000F8]" />)}
                  </div>
                  <span className="text-[11px] font-mono text-[#5F6078] px-2 py-0.5 rounded bg-[#F7F7FC] border border-[#E5E5F0]">{t.industry}</span>
                </div>
                <p className="text-sm text-[#5F6078] leading-relaxed italic">"{t.quote}"</p>
              </div>

              <div className="pt-4 border-t border-[#E5E5F0] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#480878] to-[#9030F8] flex items-center justify-center text-white font-bold text-sm">{t.author.charAt(0)}</div>
                <div>
                  <h3 className="text-sm font-bold text-[#000048]">{t.author}</h3>
                  <p className="text-xs text-[#5F6078]">{t.role}, <span className="text-[#000048] font-medium">{t.company}</span></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
