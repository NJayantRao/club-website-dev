import { getAchievements } from "@/lib/achievements";
import Achievements from "@/components/Achievements";

export const revalidate = 86400;

export default async function Page() {
  const achievements = await getAchievements();

  return <Achievements achievements={achievements} />;
}
