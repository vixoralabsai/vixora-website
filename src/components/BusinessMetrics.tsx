const BUSINESS_METRICS = [
  {
    value: "15+",
    label: "Projects Completed",
    subtext: "Successfully delivered digital projects for clients.",
    highlight: "Proven Delivery"
  },
  {
    value: "8",
    label: "Businesses Served",
    subtext: "Businesses supported with digital solutions and services.",
    highlight: "Client Experience"
  },
  {
    value: "3",
    label: "Industries Served",
    subtext: "Experience delivering solutions across multiple business sectors.",
    highlight: "Industry Reach"
  }
];

export function BusinessMetrics() {
  return (
    <section className="py-20 bg-[#F7F7FC] border-y border-[#E5E5F0] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-medium text-[#480878] bg-[#480878]/5 border border-[#480878]/15 mb-3">
            <span>OUR TRACK RECORD</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#000048] tracking-tight" style={{ color: '#000048' }}>
            Proven Scale in Numbers
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#5F6078]" style={{ color: '#475569' }}>
            A snapshot of the businesses, projects, and industries Vixora has served.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {BUSINESS_METRICS.map((metric, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-[#E5E5F0] text-center space-y-2 relative overflow-hidden group hover:border-[#9030F8]/40 hover:-translate-y-0.5 transition-all shadow-sm"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#9030F8]/5 rounded-full blur-xl pointer-events-none group-hover:bg-[#9030F8]/10 transition-all" />

              <div className="text-3xl sm:text-4xl font-black text-[#480878] font-mono">
                {metric.value}
              </div>

              <h3 className="text-sm font-bold text-[#000048] tracking-tight">
                {metric.label}
              </h3>

              <p className="text-[11px] text-[#5F6078] leading-snug">
                {metric.subtext}
              </p>

              <div className="pt-2">
                <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-[#F7F7FC] text-[#480878] border border-[#E5E5F0]">
                  {metric.highlight}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
