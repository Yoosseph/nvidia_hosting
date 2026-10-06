"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Check, ChevronDown, Copy, Menu, MessageSquare, Pencil, Plus, Settings2, Sparkles, Square, Trash2, X } from "lucide-react";
import { MessageMarkdown } from "@/components/markdown";
import { Settings } from "@/components/settings";
import { ThemeToggle } from "@/components/theme-toggle";
import { ModelDialog } from "@/components/model-dialog";
import { RenameChat } from "@/components/rename-chat";
import { CHAT_STORAGE_KEY, DEFAULT_MODEL, newConversation, readConversations, type Conversation, type Message } from "@/lib/types";
import { readChatStream } from "@/lib/stream";

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState("");
  const [ready, setReady] = useState(false);
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [apiKey, setApiKey] = useState("");
  const [models, setModels] = useState<string[]>();
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogRefresh, setCatalogRefresh] = useState(0);
  const [configured, setConfigured] = useState(false);
  const [catalogError, setCatalogError] = useState("");
  const [settings, setSettings] = useState(false);
  const [modelDialog, setModelDialog] = useState(false);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [sidebar, setSidebar] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [follow, setFollow] = useState(true);
  const abort = useRef<AbortController | null>(null);
  const running = useRef(false);
  const scroller = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const active = conversations.find(c => c.id === activeId);
  const messages = active?.messages ?? [];

  useEffect(() => {
    try {
      const saved = readConversations(localStorage.getItem(CHAT_STORAGE_KEY));
      setConversations(saved); setActiveId(saved[0]?.id ?? "");
      setModel(localStorage.getItem("nim-model") || DEFAULT_MODEL);
    } catch { /* The app also works when browser storage is unavailable. */ }
    setReady(true);
    return () => abort.current?.abort();
  }, []);

  useEffect(() => {
    if (!ready || busy) return;
    try { localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conversations)); localStorage.setItem("nim-model", model); }
    catch { setError("Browser storage is full or unavailable. This conversation will only be available in this tab."); }
  }, [conversations, ready, busy, model]);

  useEffect(() => {
    const controller = new AbortController();
    setCatalogLoading(true);
    fetch("/api/models", { headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {}, signal: controller.signal })
      .then(r => r.json()).then(data => { setConfigured(Boolean(data.configured)); setModels(data.models); setCatalogError(data.error ?? ""); })
      .catch(e => { if (e.name !== "AbortError") setCatalogError("Catalog unavailable. Showing saved models."); })
      .finally(() => { if (!controller.signal.aborted) setCatalogLoading(false); });
    return () => controller.abort();
  }, [apiKey, catalogRefresh]);

  useEffect(() => {
    if (follow && scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [messages, follow]);

  useEffect(() => {
    if (textarea.current) { textarea.current.style.height = "auto"; textarea.current.style.height = `${Math.min(textarea.current.scrollHeight, 180)}px`; }
  }, [input]);

  const updateMessages = useCallback((id: string, update: (messages: Message[]) => Message[]) => {
    setConversations(all => all.map(c => c.id === id ? { ...c, messages: update(c.messages), updatedAt: Date.now() } : c));
  }, []);

  function startNew() {
    if (running.current) return;
    setActiveId(""); setInput(""); setError(""); setSidebar(false); setFollow(true); textarea.current?.focus();
  }

  async function send() {
    const prompt = input.trim();
    if (!prompt || running.current) return;
    if (!configured && !apiKey) { setSettings(true); return; }
    running.current = true;
    const current = active ?? newConversation();
    const user: Message = { id: crypto.randomUUID(), role: "user", content: prompt };
    const reply: Message = { id: crypto.randomUUID(), role: "assistant", content: "", reasoning: "", model };
    const previous = current.messages.filter(m => m.content.trim());
    // Replace an unanswered turn when retrying instead of sending it twice.
    if (previous.at(-1)?.role === "user") previous.pop();
    const history = [...previous, user];
    if (!active) {
      setConversations(all => [{ ...current, title: prompt.slice(0, 48), messages: [...history, reply] }, ...all]);
      setActiveId(current.id);
    } else updateMessages(current.id, () => [...history, reply]);
    setInput(""); setError(""); setBusy(true); setFollow(true);
    const controller = new AbortController(); abort.current = controller;
    try {
      const response = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json", ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}) },
        body: JSON.stringify({ model, messages: history.map(({ role, content }) => ({ role, content })) }), signal: controller.signal,
      });
      if (!response.ok) { const data = await response.json(); throw new Error(data.error || "The request failed. Please try again."); }
      if (!response.body) throw new Error("The model returned an empty response.");
      let hasContent = false;
      await readChatStream(response.body, delta => {
        if (delta.content || delta.reasoning) hasContent = true;
        updateMessages(current.id, all => all.map(m => m.id === reply.id ? { ...m, content: m.content + (delta.content ?? ""), reasoning: (m.reasoning ?? "") + (delta.reasoning ?? "") } : m));
      });
      if (!hasContent) throw new Error("The model returned no text. Try another chat model.");
    } catch (e) {
      if (!controller.signal.aborted) { setError(e instanceof Error ? e.message : "Something went wrong. Please try again."); setInput(draft => draft || prompt); }
      updateMessages(current.id, all => all.filter(m => m.id !== reply.id || m.content || m.reasoning));
    } finally { setBusy(false); running.current = false; abort.current = null; textarea.current?.focus(); }
  }

  async function copyMessage(message: Message) {
    try { await navigator.clipboard.writeText(message.content); setCopied(message.id); setTimeout(() => setCopied(""), 1600); }
    catch { setError("Couldn't copy to the clipboard. You can select and copy the text manually."); }
  }

  const shortModel = model.split("/").pop() ?? model;
  return <div className="app-shell">
    {sidebar && <button className="sidebar-scrim" aria-label="Close sidebar" onClick={() => setSidebar(false)} />}
    <aside className={`sidebar ${sidebar ? "is-open" : ""}`}>
      <a className="brand" href="/" aria-label="Nim home">nim</a>
      <button className="new-chat" onClick={startNew} disabled={busy}><Plus size={17} /> New chat</button>
      <nav className="history" aria-label="Conversations">
        {conversations.map(c => <div className={`history-item ${activeId === c.id ? "active" : ""}`} key={c.id}><button disabled={busy} onClick={() => { setActiveId(c.id); setError(""); setSidebar(false); setFollow(true); }}><MessageSquare size={15} /><span>{c.title}</span></button><button className="rename-chat" disabled={busy} aria-label={`Rename ${c.title}`} title="Rename chat" onClick={() => setRenaming(c.id)}><Pencil size={13} /></button><button className="delete-chat" disabled={busy} aria-label={`Delete ${c.title}`} onClick={() => { setConversations(all => all.filter(x => x.id !== c.id)); if (activeId === c.id) setActiveId(""); }}><Trash2 size={13} /></button></div>)}
      </nav>
      <div className="sidebar-bottom"><button className="settings-button" disabled={busy} onClick={() => setSettings(true)}><Settings2 size={17} />Settings</button></div>
    </aside>

    <main className={`main ${messages.length === 0 ? "is-empty" : ""}`}>
      <header className="topbar"><div className="model-area"><button className="icon-button mobile-menu" aria-label="Open sidebar" onClick={() => setSidebar(true)}><Menu size={20} /></button><button className="model-button" disabled={busy} onClick={() => setModelDialog(true)} aria-label={`Change model: ${shortModel}`}><span>{shortModel}</span><ChevronDown size={15} /></button></div><div className="topbar-actions"><ThemeToggle /><button className="icon-button" disabled={busy} onClick={() => setSettings(true)} aria-label="Settings" title="Settings"><Settings2 size={18} /></button></div></header>
      <div className="conversation-scroll" ref={scroller} onScroll={() => { const el = scroller.current; if (el) setFollow(el.scrollHeight - el.scrollTop - el.clientHeight < 100); }}>
        {messages.length === 0 ? <section className="empty-state"><h1>New chat</h1></section> : <section className="messages" aria-label="Chat messages" aria-busy={busy}>{messages.map(m => <article key={m.id} className={`message ${m.role}`}><div className="message-avatar">{m.role === "assistant" ? <Sparkles size={17} /> : "Y"}</div><div className="message-body"><div className="message-label">{m.role === "user" ? "You" : "Nim"}{m.role === "assistant" && <span>{m.model?.split("/").pop()}</span>}</div>{m.reasoning && <details className="reasoning"><summary>Thinking</summary><div>{m.reasoning}</div></details>}{m.role === "user" ? <div className="user-content">{m.content}</div> : <MessageMarkdown content={m.content} />}{m.role === "assistant" && !m.content && busy && <div className="typing" role="status" aria-label="Generating response"><span /><span /><span /></div>}{m.role === "assistant" && m.content && <button className="copy-message" aria-label="Copy response" onClick={() => copyMessage(m)}>{copied === m.id ? <Check size={14} /> : <Copy size={14} />}{copied === m.id ? "Copied" : "Copy"}</button>}</div></article>)}</section>}
      </div>
      <div className="composer-region">
        {!follow && messages.length > 0 && <button className="jump-bottom icon-button" aria-label="Jump to latest message" onClick={() => setFollow(true)}><ArrowDown size={18} /></button>}
        {error && <div className="error-banner" role="alert"><span>{error}</span><button aria-label="Dismiss error" onClick={() => setError("")}><X size={16} /></button></div>}
        <form className={`composer ${busy ? "generating" : ""}`} onSubmit={e => { e.preventDefault(); void send(); }}>
          <textarea ref={textarea} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(); } }} placeholder="Message" aria-label="Message" rows={1} />
          <div className="composer-toolbar">{busy ? <button type="button" className="send-button" aria-label="Stop generating" onClick={() => abort.current?.abort()}><Square size={15} fill="currentColor" /></button> : <button type="submit" className="send-button" aria-label="Send message" disabled={!input.trim() || !ready}><ArrowUp size={19} /></button>}</div>
        </form>
      </div>
    </main>
    {settings && <Settings apiKey={apiKey} model={model} models={models} configured={configured} catalogError={catalogError} catalogLoading={catalogLoading} onRefresh={() => setCatalogRefresh(n => n + 1)} onClose={() => setSettings(false)} onSave={(key, selected) => { setApiKey(key); setModel(selected); setSettings(false); setError(""); textarea.current?.focus(); }} />}
    {modelDialog && <ModelDialog selected={model} models={models} refreshing={catalogLoading} error={catalogError} onRefresh={() => setCatalogRefresh(n => n + 1)} onClose={() => setModelDialog(false)} onSelect={id => { setModel(id); setModelDialog(false); setError(""); textarea.current?.focus(); }} />}
    {renaming && <RenameChat title={conversations.find(c => c.id === renaming)?.title ?? ""} onClose={() => setRenaming(null)} onSave={title => { setConversations(all => all.map(c => c.id === renaming ? { ...c, title } : c)); setRenaming(null); }} />}
  </div>;
}
