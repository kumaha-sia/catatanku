import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChatContent } from "@/components/chat-content";

export default async function ChatPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <ChatContent />;
}
