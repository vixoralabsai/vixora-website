import { Globe2 } from 'lucide-react';
import { TRUSTED_BRANDS } from '../data/vixoraContent';

export function TrustedBy() {
  return (
    <div className="relative z-20 -mt-8 sm:-mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-neutral-100">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="shrink-0 text-center lg:text-left">
            <span className="text-xs sm:text-sm font-semibold text-purple-900 flex items-center gap-1.5 justify-center lg:justify-start">
              <span className="w-2 h-2 rounded-full bg-purple-600" />
              Some of our clients
            </span>
          </div>

          <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 items-center justify-items-center">
            {TRUSTED_BRANDS.map((client) => (
              <div
                key={client.name}
                className="flex items-center gap-2 group hover:scale-105 transition-transform"
              >
                <div className="shrink-0 w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Globe2 className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs sm:text-sm font-bold text-neutral-900 leading-tight">
                    {client.name}
                  </span>
                  <span className="text-[9px] font-semibold text-neutral-500 tracking-wider uppercase">
                    {client.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
