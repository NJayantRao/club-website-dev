"use client";

import { motion } from "framer-motion";
import MemberCard from "./MemberCard";
import type { Member } from "@/data/initial-members";

interface TeamSectionProps {
  title: string;
  color: string;
  members: Member[];
}

export default function TeamSection({
  title,
  color,
  members,
}: TeamSectionProps) {
  return (
    <section className="mb-24">
      <div className="mb-12 flex items-center gap-4">
        <span
          className="inline-flex h-3 w-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="text-2xl md:text-3xl font-semibold uppercase tracking-[0.35em] text-white"
        >
          {title}
        </motion.h2>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
        {members.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>
    </section>
  );
}
