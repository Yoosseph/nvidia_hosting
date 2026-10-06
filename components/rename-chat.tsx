"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

type Props = { title: string; onSave: (title: string) => void; onClose: () => void };

export function RenameChat({ title, onSave, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(title);

  useEffect(() => { dialog.current?.showModal(); input.current?.select(); }, []);

  return <dialog ref={dialog} className="settings-dialog" aria-labelledby="rename-title" onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <form onSubmit={e => { e.preventDefault(); if (name.trim()) onSave(name.trim()); }}>
      <div className="dialog-heading"><h2 id="rename-title">Rename chat</h2><button type="button" className="icon-button" aria-label="Close rename chat" onClick={onClose}><X size={20} /></button></div>
      <label htmlFor="chat-name">Chat name</label>
      <input ref={input} id="chat-name" value={name} onChange={e => setName(e.target.value)} maxLength={120} required autoComplete="off" />
      <button type="submit" className="save-button" disabled={!name.trim()}>Save</button>
    </form>
  </dialog>;
}
