"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { advisors, alumni, members } from "@/data/initial-members";
import Image from "next/image";

type SectionType = "members" | "alumni";

const fallbackAvatar = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=111&color=fff`;

const OurTeam = () => {
  const [activeSection, setActiveSection] = useState<SectionType>("members");

  const handleImageError = (
    event: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const image = event.currentTarget;
    image.src = fallbackAvatar(image.alt || "member");
  };

  const renderCard = (
    member: { name: string; role: string; img: string; linkedin?: string },
    delay: number
  ) => {
    const clickable = Boolean(member.linkedin);

    return (
      <div
        key={`${member.name}-${member.img}-${delay}`}
        data-aos="fade-up"
        data-aos-delay={delay}
        onClick={() =>
          member.linkedin && window.open(member.linkedin, "_blank")
        }
        className={`group relative p-1 rounded-[2.5rem] bg-linear-to-b from-white/10 to-transparent hover:from-purple-500/50 transition-all duration-500 tilt-card h-120 ${
          clickable ? "cursor-pointer" : ""
        }`}
      >
        <div className="h-full bg-[#080808] rounded-[2.4rem] p-10 border border-white/5 relative overflow-hidden flex flex-col items-center justify-center text-center">
          <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="w-5 h-5 text-white" />
          </div>
          <div className="w-40 h-40 rounded-3xl overflow-hidden mb-8 border border-white/5 group-hover:border-purple-500/20 transition-all duration-700 bg-neutral-900 shadow-2xl">
            <Image
              src={`/members/${member.img}`}
              alt={member.name}
              fill
              className="object-cover transition-all duration-700 group-hover:scale-110"
              onError={handleImageError}
            />
          </div>
          <h4 className="text-2xl font-bold text-white mb-3 tracking-tight leading-tight">
            {member.name}
          </h4>
          <p className="text-[11px] text-purple-400/80 font-mono uppercase tracking-[0.25em]">
            {member.role}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-32">
        <h1
          data-aos="fade-up"
          className="text-6xl md:text-8xl font-bold tracking-tighter text-white mb-8"
        >
          OUR TEAM
        </h1>
        <p
          data-aos="fade-up"
          data-aos-delay="100"
          className="text-neutral-400 max-w-2xl mx-auto text-base md:text-lg font-light leading-relaxed"
        >
          The visionaries and innovators behind Club Excel. From our dedicated
          advisors to our successful alumni network.
        </p>
      </div>

      <section className="mb-40">
        <h2
          data-aos="fade-right"
          className="text-sm font-mono text-blue-500 mb-16 uppercase tracking-widest flex items-center gap-3"
        >
          <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></span>{" "}
          Club Advisors
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {advisors.map((advisor, idx) => (
            <div
              key={advisor.name}
              data-aos="fade-up"
              data-aos-delay={idx * 100}
              className="group relative p-1 rounded-4xl bg-linear-to-b from-white/10 to-transparent hover:from-blue-500/50 transition-all duration-500 tilt-card"
            >
              <div className="h-full bg-[#080808] rounded-[1.9rem] p-10 border border-white/5 relative overflow-hidden flex flex-col items-center">
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-6 h-6 text-white" />
                </div>
                <div className="w-64 h-64 rounded-2xl overflow-hidden mb-10 border border-white/10 group-hover:border-blue-500/30 transition-all duration-700 bg-neutral-900 shadow-2xl">
                  <Image
                    src={`/members/${advisor.img}`}
                    alt={advisor.name}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={handleImageError}
                  />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">
                  {advisor.name}
                </h3>
                <p className="text-blue-400 font-mono text-xs tracking-[0.2em] uppercase mb-1">
                  Club Advisor
                </p>
                <p className="text-neutral-500 font-mono text-[10px] tracking-widest uppercase mb-8">
                  {advisor.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-center gap-6 mb-20" data-aos="fade-up">
        <button
          onClick={() => setActiveSection("members")}
          className={`px-8 py-3 rounded-full font-mono text-sm tracking-widest transition-all duration-300 border ${
            activeSection === "members"
              ? "bg-purple-500 text-white border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
              : "bg-transparent text-neutral-500 border-white/10 hover:border-white/20"
          }`}
        >
          CORE MEMBERS
        </button>
        <button
          onClick={() => setActiveSection("alumni")}
          className={`px-8 py-3 rounded-full font-mono text-sm tracking-widest transition-all duration-300 border ${
            activeSection === "alumni"
              ? "bg-purple-500 text-white border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
              : "bg-transparent text-neutral-500 border-white/10 hover:border-white/20"
          }`}
        >
          CLUB ALUMNI
        </button>
      </div>

      {activeSection === "members" ? (
        <section className="mb-40 transition-all duration-500">
          <h2
            data-aos="fade-right"
            className="text-sm font-mono text-purple-500 mb-16 uppercase tracking-widest flex items-center gap-3"
          >
            <span className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse"></span>{" "}
            Core Members
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {members.map((member, idx) => renderCard(member, (idx % 4) * 50))}
          </div>
        </section>
      ) : (
        <section className="transition-all duration-500">
          <h2
            data-aos="fade-right"
            className="text-sm font-mono text-purple-500 mb-16 uppercase tracking-widest flex items-center gap-3"
          >
            <span className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse"></span>{" "}
            Distinguished Alumni
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {alumni.map((member, idx) => renderCard(member, (idx % 4) * 50))}
          </div>
        </section>
      )}
    </div>
  );
};

export default OurTeam;
