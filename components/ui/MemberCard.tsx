"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { FiGithub, FiLinkedin } from "react-icons/fi";
import type { Member } from "@/data/initial-members";

const platformIcon = (platform: string) => {
  switch (platform) {
    case "github":
      return <FiGithub className="w-4 h-4" />;

    case "linkedin":
      return <FiLinkedin className="w-4 h-4" />;

    default:
      return <Globe className="w-4 h-4" />;
  }
};

interface Props {
  member: Member;
}

export default function MemberCard({ member }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      whileHover={{ y: -8 }}
      className="group relative rounded-[2.5rem] border border-white/10 bg-[#0B0B0B] overflow-hidden transition-all duration-500 hover:border-white/20"
    >
      {/* Hover Border */}
      <div className="absolute inset-0 rounded-[2.5rem] border border-transparent group-hover:border-[#7C3AED]/50 transition-all duration-500 pointer-events-none" />

      {/* Social Icons */}
      {member.socials && member.socials.length > 0 && (
        <div className="absolute top-5 right-5 z-20 flex flex-col gap-2 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          {member.socials.map((social) => (
            <a
              key={social.platform}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-[#7C3AED] transition-colors"
            >
              {platformIcon(social.platform)}
            </a>
          ))}
        </div>
      )}

      {/* Image */}
      <div className="relative flex justify-center pt-14">
        <div className="relative w-52 h-72 rounded-[2rem] overflow-hidden">
          <Image
            src={member.image}
            alt={member.name}
            fill
            className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-10 pt-8 text-center">
        <h3 className="text-4xl font-bold text-white leading-tight">
          {member.name}
        </h3>

        <p className="mt-4 uppercase tracking-[0.45em] text-[#8B5CF6] text-sm">
          {member.section === "advisor"
            ? "Club Advisor"
            : member.section === "core"
              ? "Core Member"
              : "Club Alumni"}
        </p>

        <p className="mt-2 text-neutral-500 uppercase tracking-[0.25em] text-xs">
          {member.role}
        </p>
      </div>
    </motion.div>
  );
}
