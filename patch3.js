const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Dashboard.tsx', 'utf8');

const regex = /<div className="flex items-center justify-between border-t-2 border-surface\/30 pt-4">[\s\S]*?\{personalWallets\.length\} dompet terhubung[\s\S]*?<\/button>\s*<\/div>/;

const replacement = `{/* The Daily Post-It Note (Fin-Roast) */}
              <div className="mt-4 -mx-2 bg-[#FFB43A] text-text-primary border-4 border-text-primary p-4 shadow-[4px_4px_0_0_#171B22] transform rotate-[-1deg] hover:rotate-0 transition-transform cursor-default relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-4 bg-white/50 border-2 border-text-primary shadow-[2px_2px_0_0_#171B22] rotate-[2deg]"></div>
                <p className="font-black text-xs uppercase tracking-widest mb-2 opacity-70">🤖 Nasihat Harian AI</p>
                {isLoadingRoast ? (
                  <div className="animate-pulse flex flex-col gap-2">
                    <div className="h-3 bg-text-primary/20 w-full"></div>
                    <div className="h-3 bg-text-primary/20 w-3/4"></div>
                  </div>
                ) : (
                  <p className="font-bold text-sm leading-snug">
                    {roastData?.data?.insight || 'Hmm, datanya kurang nih buat di-roasting.'}
                  </p>
                )}
              </div>`;

if (regex.test(code)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('frontend/src/pages/Dashboard.tsx', code);
    console.log("SUCCESS");
} else {
    console.log("TARGET NOT FOUND! Regex mismatch.");
}
