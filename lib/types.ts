export type Message = { id: string; role: "user" | "assistant"; content: string; reasoning?: string; model?: string };
export type Conversation = { id: string; title: string; messages: Message[]; updatedAt: number };
export const DEFAULT_MODEL = "nvidia/nemotron-3-super-120b-a12b";
export const CHAT_STORAGE_KEY = "nim-conversations-v1";

export function newConversation(): Conversation {
  return { id: crypto.randomUUID(), title: "New conversation", messages: [], updatedAt: Date.now() };
}

export function readConversations(raw: string | null): Conversation[] {
  try {
    const parsed: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((c): c is Conversation => c && typeof c.id === "string" && typeof c.title === "string" && Array.isArray(c.messages) && c.messages.every((m: Message) => m && typeof m.id === "string" && ["user", "assistant"].includes(m.role) && typeof m.content === "string" && (m.reasoning === undefined || typeof m.reasoning === "string")));
  } catch { return []; }
}
