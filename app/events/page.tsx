import Events from "@/components/Events";
import { getEvents } from "@/lib/events";

export const revalidate = 84600;

export default async function Page() {
  const events = await getEvents();

  return (
    <>
      <Events events={events} />
    </>
  );
}
