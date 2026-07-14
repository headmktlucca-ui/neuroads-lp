'use client';

/* ─── Static header — user/company display, no company switching ────── */
interface CompanySwitcherTriggerProps {
  companyName: string;
  userName: string;
  userPhoto?: string | null;
  isDark?: boolean;
  className?: string;
}

export function CompanySwitcherTrigger({
  companyName,
  userName,
  userPhoto,
  isDark = true,
  className = '',
}: CompanySwitcherTriggerProps) {
  const greeting = getGreeting();

  function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  return (
    <div className={`w-full flex items-center gap-3 px-2 py-2 ${className}`}>
      {/* Avatar */}
      <div
        className={`relative w-[43px] h-[43px] rounded-full overflow-hidden shrink-0 ring-2 ring-white/60 shadow-[0_4px_14px_rgba(0,0,0,0.22)] flex items-center justify-center text-white font-black text-[15px] select-none bg-gradient-to-tr from-[#cc4400] to-[#FF8805]`}
      >
        {userPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={userPhoto} alt="" className="w-full h-full object-cover" />
        ) : (
          (userName.charAt(0) || 'N').toUpperCase()
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col min-w-0 flex-1">
        {companyName && (
          <span className={`text-[17px] font-black truncate block leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {companyName.charAt(0).toUpperCase() + companyName.slice(1).toLowerCase()}
          </span>
        )}
        <div className="flex items-baseline gap-1 mt-0.5 min-w-0">
          <span className={`text-[10px] font-normal leading-none shrink-0 ${isDark ? 'text-white/60' : 'text-slate-400'}`}>
            {greeting}
          </span>
          <span className={`text-[10px] font-normal truncate leading-none ${isDark ? 'text-white/70' : 'text-slate-500'}`}>
            {userName.split(' ')[0]}
          </span>
        </div>
      </div>
    </div>
  );
}
