export function HeroIllustration() {
  return (
    <div className="relative w-full">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(10px); }
        }
        @keyframes pulse-subtle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        .float-1 { animation: float 3s ease-in-out infinite; }
        .float-2 { animation: float-slow 4s ease-in-out infinite; }
        .float-3 { animation: float-reverse 3.5s ease-in-out infinite; }
        .pulse-circle { animation: pulse-subtle 2s ease-in-out infinite; }
      `}</style>
      
      <svg
        viewBox="0 0 800 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-3xl mx-auto"
      >
        {/* Decorative circles with pulse animation */}
        <circle cx="100" cy="80" r="40" fill="#F472B6" className="pulse-circle" style={{ animationDelay: '0s' }} />
        <circle cx="700" cy="100" r="50" fill="#86EFAC" className="pulse-circle" style={{ animationDelay: '0.5s' }} />
        <circle cx="650" cy="320" r="30" fill="#FCA5A5" className="pulse-circle" style={{ animationDelay: '1s' }} />
        <circle cx="150" cy="350" r="35" fill="#A5B4FC" className="pulse-circle" style={{ animationDelay: '1.5s' }} />
      
      {/* Wavy lines */}
      <path
        d="M 0 200 Q 100 150, 200 200 T 400 200"
        stroke="#86EFAC"
        strokeWidth="3"
        opacity="0.4"
        fill="none"
      />
      <path
        d="M 400 250 Q 500 220, 600 250 T 800 250"
        stroke="#F472B6"
        strokeWidth="3"
        opacity="0.4"
        fill="none"
      />
      
      {/* House icon with float animation */}
      <g transform="translate(250, 100)" className="float-1" style={{ transformOrigin: '60px 75px' }}>
        <path
          d="M 60 40 L 30 70 L 30 120 L 90 120 L 90 70 Z"
          fill="#2563EB"
          opacity="0.9"
        />
        <path d="M 20 70 L 60 30 L 100 70" fill="none" stroke="#2563EB" strokeWidth="3" />
        <rect x="50" y="90" width="20" height="30" fill="#60A5FA" />
        <rect x="40" y="75" width="15" height="15" fill="#60A5FA" />
        <rect x="65" y="75" width="15" height="15" fill="#60A5FA" />
      </g>
      
      {/* Document/checklist with float animation */}
      <g transform="translate(480, 120)" className="float-2" style={{ transformOrigin: '40px 50px' }}>
        <rect x="0" y="0" width="80" height="100" rx="5" fill="white" stroke="#2563EB" strokeWidth="2" />
        <line x1="15" y1="25" x2="65" y2="25" stroke="#86EFAC" strokeWidth="3" />
        <line x1="15" y1="45" x2="65" y2="45" stroke="#86EFAC" strokeWidth="3" />
        <line x1="15" y1="65" x2="65" y2="65" stroke="#60A5FA" strokeWidth="3" />
        <circle cx="15" cy="25" r="5" fill="#86EFAC" />
        <circle cx="15" cy="45" r="5" fill="#86EFAC" />
        <circle cx="15" cy="65" r="5" fill="#60A5FA" />
      </g>
      
      {/* Character with laptop */}
      <g transform="translate(340, 180)">
        {/* Body */}
        <ellipse cx="60" cy="120" rx="35" ry="50" fill="#86EFAC" />
        
        {/* Head */}
        <circle cx="60" cy="50" r="30" fill="#FCA5A5" opacity="0.9" />
        
        {/* Eyes */}
        <circle cx="52" cy="48" r="3" fill="#1E3A8A" />
        <circle cx="68" cy="48" r="3" fill="#1E3A8A" />
        
        {/* Smile */}
        <path
          d="M 50 58 Q 60 63, 70 58"
          fill="none"
          stroke="#1E3A8A"
          strokeWidth="2"
        />
        
        {/* Arms */}
        <ellipse cx="30" cy="110" rx="12" ry="30" fill="#86EFAC" transform="rotate(-20 30 110)" />
        <ellipse cx="90" cy="110" rx="12" ry="30" fill="#86EFAC" transform="rotate(20 90 110)" />
        
        {/* Laptop */}
        <rect x="35" y="130" width="50" height="30" rx="2" fill="#1E3A8A" />
        <rect x="38" y="133" width="44" height="24" fill="#60A5FA" />
        <line x1="37" y1="160" x2="10" y2="170" stroke="#1E3A8A" strokeWidth="3" />
        <line x1="83" y1="160" x2="110" y2="170" stroke="#1E3A8A" strokeWidth="3" />
        <rect x="10" y="170" width="100" height="3" fill="#1E3A8A" />
      </g>
      
      {/* Keys icon with float animation */}
      <g transform="translate(180, 250)" className="float-3" style={{ transformOrigin: '35px 20px' }}>
        <circle cx="20" cy="20" r="15" fill="none" stroke="#FCA5A5" strokeWidth="3" />
        <circle cx="20" cy="20" r="8" fill="none" stroke="#FCA5A5" strokeWidth="3" />
        <rect x="30" y="18" width="25" height="4" fill="#FCA5A5" />
        <rect x="48" y="14" width="4" height="8" fill="#FCA5A5" />
        <rect x="54" y="14" width="4" height="8" fill="#FCA5A5" />
      </g>
      
      {/* Money/coin stack with float animation */}
      <g transform="translate(550, 260)" className="float-1" style={{ transformOrigin: '30px 35px' }}>
        <ellipse cx="30" cy="40" rx="25" ry="8" fill="#FBBF24" opacity="0.9" />
        <ellipse cx="30" cy="35" rx="25" ry="8" fill="#FBBF24" opacity="0.9" />
        <ellipse cx="30" cy="30" rx="25" ry="8" fill="#FBBF24" />
        <text x="30" y="34" textAnchor="middle" fill="#1E3A8A" fontSize="16" fontWeight="bold">F</text>
      </g>
    </svg>
    
    {/* Available on AppStore | Google Play Badge */}
    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg border border-gray-200">
      <p className="text-xs font-semibold text-gray-700 mb-1">Disponible sur</p>
      <div className="flex gap-3 items-center">
        <a href="#" className="flex items-center gap-1 text-sm font-semibold text-gray-800 hover:text-blue-600 transition">
          <span>App Store</span>
        </a>
        <span className="text-gray-300">|</span>
        <a href="#" className="flex items-center gap-1 text-sm font-semibold text-gray-800 hover:text-blue-600 transition">
          <span>Google Play</span>
        </a>
      </div>
    </div>
    </div>
  );
}
