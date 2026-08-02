import Recruitment from "@/components/Recruitment";
import RecruitmentClosed from "@/components/RecruitmentClosed";
import getRecruitmentEventStatus from "@/lib/recruitment-status";

export const dynamic = "force-dynamic";

const Page = async () => {
  const status = await getRecruitmentEventStatus();

  if (!status.isOpen) {
    return <RecruitmentClosed opensAt={status.opensAt} />;
  }

  return <Recruitment />;
};

export default Page;
