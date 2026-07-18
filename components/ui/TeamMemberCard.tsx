import { useMemo, useState, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";

export type TeamMemberCardSize = "advisor" | "member";

export interface TeamMemberCardProps {
  name: string;
  role: string;
  designation?: string | null;
  img: string | null;
  label: string;
  accent: "blue" | "purple";
  size: TeamMemberCardSize;
  linkedin?: string;
  delay?: number;
}

const accentHoverClass = {
  blue: "hover:from-blue-500/50",
  purple: "hover:from-purple-500/50",
};

const imageSizeClass = {
  advisor: "w-64 h-64 rounded-2xl",
  member: "w-40 h-40 rounded-3xl",
};

const fallbackAvatar = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=111&color=fff`;

const resolveSrc = (img: string | null, name: string) =>
  img ? `${img}` : fallbackAvatar(name);

export default function TeamMemberCard({
  name,
  role,
  designation,
  label,
  img,
  linkedin,
  accent,
  size,
  delay = 0,
}: TeamMemberCardProps) {
  const [src, setSrc] = useState<string>(() => resolveSrc(img, name));
  const clickable = Boolean(linkedin);

  useEffect(() => {
    setSrc(resolveSrc(img, name));
  }, [img, name]);

  const handleError = () => {
    setSrc(fallbackAvatar(name));
  };

  const wrapperClass = useMemo(
    () =>
      `group relative p-1 rounded-[2.5rem] bg-linear-to-b from-white/10 to-transparent ${accentHoverClass[accent]} transition-all duration-500 tilt-card h-120 ${
        clickable ? "cursor-pointer" : ""
      }`,
    [accent, clickable]
  );

  return (
    <div
      data-aos="fade-up"
      data-aos-delay={delay}
      className={wrapperClass}
      onClick={() => linkedin && window.open(linkedin, "_blank")}
    >
      <div className="h-full bg-[#080808] rounded-[2.4rem] p-10 border border-white/5 relative overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight className="w-5 h-5 text-white" />
        </div>
        <div
          className={`${imageSizeClass[size]} overflow-hidden mb-8 border border-white/5 group-hover:border-purple-500/20 transition-all duration-700 bg-neutral-900 shadow-2xl`}
        >
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
            onError={handleError}
          />
        </div>
        <h4 className="text-2xl font-bold text-white mb-3 tracking-tight leading-tight">
          {name}
        </h4>
        <p className="text-[11px] text-purple-400/80 font-mono uppercase tracking-[0.25em]">
          {label}
        </p>
        {designation && (
          <p className="text-neutral-300 font-mono text-[11px] tracking-widest uppercase mt-2">
            {designation}
          </p>
        )}
        <p className="text-neutral-500 font-mono text-[10px] tracking-widest uppercase mt-1">
          {role}
        </p>
      </div>
    </div>
  );
}
