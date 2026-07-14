import OurTeam from "@/components/OurTeam";
import { getAdvisors } from "@/lib/advisors";
import { getAlumni } from "@/lib/alumni";
import { getMembers } from "@/lib/members";

export const revalidate = 86400;

const page = async () => {
  const [advisors, members, alumni] = await Promise.all([
    getAdvisors(),
    getMembers(),
    getAlumni(),
  ]);
  return (
    <>
      <OurTeam advisors={advisors} members={members} alumni={alumni} />
    </>
  );
};

export default page;
