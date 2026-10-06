"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { ModelPicker } from "@/components/model-picker";

type Props = { selected: string; models?: string[]; refreshing: boolean; error: string; onRefresh: () => void; onSelect: (id: string) => void; onClose: () => void };

export function ModelDialog({ selected, models, refreshing, error, onRefresh, onSelect, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);

  return <dialog ref={dialog} className="settings-dialog model-dialog" aria-labelledby="model-dialog-title" onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="dialog-heading"><h2 id="model-dialog-title">Models</h2><button className="icon-button" aria-label="Close models" onClick={onClose}><X size={20} /></button></div>
    <ModelPicker selected={selected} liveIds={models} refreshing={refreshing} onSelect={onSelect} onRefresh={onRefresh} />
    {error && <p className="field-help warning">{error}</p>}
  </dialog>;
}
