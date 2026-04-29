const WhatsApp = ({ size = 18 }: { size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const Instagram = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const Linkedin = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect width="4" height="12" x="2" y="9"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-bg-secondary border-t border-border py-12 relative overflow-hidden">
      {/* Background Neural Grid (Faded) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#FF4D00_0%,_transparent_1px)] bg-[length:20px_20px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex-shrink-0">
            <div className="relative flex items-center group cursor-pointer">
              {/* Neural Vector Icon (SVG) */}
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500">
                <path d="M16 4C11.5817 4 8 7.58172 8 12C8 14.42 9.07 16.59 10.77 18.07C10.77 18.07 11.5 19.5 11.5 21C11.5 22.5 12.5 24 14.5 24H17.5C19.5 24 20.5 22.5 20.5 21C20.5 19.5 21.23 18.07 21.23 18.07C22.93 16.59 24 14.42 24 12C24 7.58172 20.4183 4 16 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 11H20" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2"/>
                <path d="M12 15H20" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2"/>
                <path d="M16 4V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M16 24V28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              
              {/* Brand Text */}
              <span className="ml-2 text-2xl font-black tracking-tighter text-text-main group-hover:text-text-main transition-colors">
                NEURO<span className="text-primary font-light">ADS</span>
              </span>
              
              {/* Version Badge */}
              <span className="ml-3 mt-1 text-[10px] font-mono text-text-dim">v4.0.2</span>
            </div>
          </div>
          
          <div className="text-center">
            <a href="mailto:avante@neuroads.com.br" className="text-text-muted font-bold hover:text-primary transition-colors text-sm">
              AVANTE@NEUROADS.COM.BR
            </a>
          </div>
 
          {/* Social Links */}
          <div className="flex gap-6">
            <SocialIcon icon={WhatsApp} href="https://wa.me/message/F36EBPNYPSTKK1" />
            <SocialIcon icon={Instagram} href="https://www.instagram.com/neuroads.oficial" />
            <SocialIcon icon={Linkedin} href="https://www.linkedin.com/company/neuroads" />
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono text-text-dim uppercase tracking-widest">
          <p>© 2026 NeuroAds Laboratory. All Neural Rights Reserved.</p>
          <div className="flex gap-6">
            <a href="/privacidade" className="hover:text-text-main transition-colors">Privacy_Protocol</a>
            <a href="/termos" className="hover:text-text-main transition-colors">Terms_of_Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ icon: Icon, href }: { icon: React.ElementType, href: string }) {
  return (
    <a 
      href={href} 
      target="_blank"
      rel="noopener noreferrer"
      className="text-text-dim hover:text-primary transition-colors p-2 bg-white rounded-lg border border-border hover:border-primary/50"
    >
      <Icon size={18} />
    </a>
  );
}
