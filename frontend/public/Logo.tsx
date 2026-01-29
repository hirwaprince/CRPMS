// src/components/Logo.tsx (Alternative Design)

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  textColor?: string;
  variant?: "dark" | "light";
}

export default function Logo({ 
  size = "md", 
  showText = true, 
  textColor = "text-gray-900",
  variant = "dark"
}: LogoProps) {
  const sizes = {
    sm: { icon: 32, text: "text-lg" },
    md: { icon: 40, text: "text-xl" },
    lg: { icon: 56, text: "text-2xl" },
    xl: { icon: 80, text: "text-3xl" },
  };

  const { icon, text } = sizes[size];
  
  const bgColor = variant === "dark" ? "#111827" : "#FFFFFF";
  const primaryColor = variant === "dark" ? "#FFFFFF" : "#111827";
  const accentColor = "#6B7280";

  return (
    <div className="flex items-center gap-3">
      {/* Custom SVG Logo - SP Letters with Wrench */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Rounded Square Background */}
        <rect x="2" y="2" width="96" height="96" rx="20" fill={bgColor} stroke={accentColor} strokeWidth="2" />
        
        {/* Letter S */}
        <path
          d="M25 35 C25 28 32 24 40 24 C48 24 52 28 52 33 C52 38 48 41 42 43 L32 47 C26 49 22 53 22 60 C22 68 30 74 40 74 C50 74 56 69 56 62"
          stroke={primaryColor}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Letter P */}
        <path
          d="M62 74 L62 24 L75 24 C82 24 88 30 88 38 C88 46 82 52 75 52 L62 52"
          stroke={primaryColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Wrench Icon (small, top right corner) */}
        <circle cx="82" cy="18" r="10" fill={accentColor} />
        <path
          d="M78 14 L86 22 M82 14 L82 22 M78 18 L86 18"
          stroke={bgColor}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {/* Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold ${text} ${textColor} leading-tight tracking-tight`}>
            SmartPark
          </span>
          <span className={`text-xs ${textColor === "text-white" ? "text-gray-400" : "text-gray-500"} tracking-wide`}>
            CAR REPAIR SYSTEM
          </span>
        </div>
      )}
    </div>
  );
}