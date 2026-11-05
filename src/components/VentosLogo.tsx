import React from "react";

interface VentosLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textClassName?: string;
}

export const VentosLogo: React.FC<VentosLogoProps> = ({
  className = "",
  size = 32,
  showText = false,
  textClassName = "text-base font-bold tracking-tight text-[#122C32]",
}) => {
  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <div
        className="relative flex items-center justify-center rounded-xl bg-orange-500/10 p-1 shrink-0"
        style={{ width: size, height: size }}
      >
        <img
          src="/icon-square.png"
          alt="Ventos Logo"
          className="w-full h-full object-contain filter drop-shadow-2xs"
          width={size}
          height={size}
        />
      </div>

      {showText && (
        <span className={textClassName}>
          Ventos<span className="text-[#F97316]">.</span>
        </span>
      )}
    </div>
  );
};
