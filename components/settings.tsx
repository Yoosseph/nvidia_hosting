"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Eye, EyeOff, X } from "lucide-react";
import { ModelPicker } from "@/components/model-picker";

type Props = { apiKey: string; model: string; models?: string[]; configured: boolean; catalogError: string; catalogLoading: boolean; onRefresh: () => void; onClose: () => void; onSave: (key: string, model: string) => void };

export function Settings({ apiKey, model, models, configured, catalogError, catalogLoading, onRefresh, onClose, onSave }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [key, setKey] = useState(apiKey);
  const [selected, setSelected] = useState(model);
  const [visible, setVisible] = useState(false);
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog ref={dialog} className="settings-dialog" aria-labelledby="settings-title" onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <form onSubmit={e => { e.preventDefault(); if (selected.trim()) onSave(key.trim(), selected.trim()); }}>
      <div className="dialog-heading"><h2 id="settings-title">Settings</h2><button type="button" className="icon-button" aria-label="Close settings" onClick={onClose}><X size={20} /></button></div>
      <label htmlFor="api-key">NVIDIA API key</label>
      <div className="secret-input"><input id="api-key" type={visible ? "text" : "password"} value={key} onChange={e => setKey(e.target.value)} placeholder={configured ? "Using your configured key" : "nvapi-…"} autoComplete="off" spellCheck={false} /><button type="button" aria-label={visible ? "Hide key" : "Show key"} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
      <p className="field-help">Key stays in this tab. Leave blank to use the server key.</p>
      <a className="key-link" href="https://build.nvidia.com" target="_blank" rel="noopener noreferrer">Get API key <ExternalLink size={13} /></a>
      <label htmlFor="model-id">Model ID</label>
      <input id="model-id" value={selected} onChange={e => setSelected(e.target.value)} placeholder="provider/model-name" required spellCheck={false} />
      <ModelPicker selected={selected} liveIds={models} refreshing={catalogLoading} onSelect={setSelected} onRefresh={onRefresh} />
      {catalogError && <p className="field-help warning">{catalogError}</p>}
      <button className="save-button" type="submit">Save</button>
    </form>
  </dialog>;
}
