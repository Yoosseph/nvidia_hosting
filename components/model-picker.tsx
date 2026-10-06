"use client";

import { useMemo, useState } from "react";
import { Check, ExternalLink, RefreshCw, Search } from "lucide-react";
import apiSnapshot from "@/data/nvidia-models.json";
import catalogSnapshot from "@/data/nvidia-catalog.json";
import { buildModelCatalog, modelStatus, searchModels } from "@/lib/model-catalog";

type Props = { selected: string; liveIds?: string[]; refreshing: boolean; onSelect: (id: string) => void; onRefresh: () => void };

export function ModelPicker({ selected, liveIds, refreshing, onSelect, onRefresh }: Props) {
  const [query, setQuery] = useState("");
  const catalog = useMemo(() => buildModelCatalog(apiSnapshot.models, catalogSnapshot.models, liveIds), [liveIds]);
  const matches = useMemo(() => searchModels(catalog, query), [catalog, query]);

  return <div className="model-picker">
    <div className="model-search"><Search size={15} aria-hidden="true" /><input aria-label="Search models" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search models or providers" autoComplete="off" spellCheck={false} /></div>
    <div className="model-results-heading"><span role="status">{matches.length} models</span><button type="button" onClick={onRefresh} disabled={refreshing} aria-label="Refresh models" title="Refresh models"><RefreshCw size={13} className={refreshing ? "refreshing" : ""} /></button></div>
    <div className="model-results" role="group" aria-label="Model search results">
      {matches.map(option => {
        const selectable = option.apiAvailable && option.kind === "chat";
        return <div className={`model-option ${selected === option.id ? "selected" : ""}`} key={option.id}>
          <button type="button" disabled={!selectable} onClick={() => onSelect(option.id)} aria-label={`Select ${option.id}`} aria-pressed={selected === option.id} title={selectable ? option.id : `${modelStatus(option)} — requires a separate interface or endpoint`}>
            <span className="model-option-text"><strong>{option.name}</strong><small>{option.id}</small></span>
            {selected === option.id ? <Check size={14} /> : <span className="model-kind">{modelStatus(option)}</span>}
          </button>
          {!selectable && <a href={option.url} target="_blank" rel="noopener noreferrer" aria-label={`View ${option.name} on NVIDIA`} title="View on NVIDIA"><ExternalLink size={13} /></a>}
        </div>;
      })}
      {matches.length === 0 && <p className="model-no-results">No matches. You can enter an exact model ID above.</p>}
    </div>
  </div>;
}
