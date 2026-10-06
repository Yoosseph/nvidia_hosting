"use client";

import { Children, isValidElement, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Check, Copy } from "lucide-react";

function CodeBlock({ children }: { children?: React.ReactNode }) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const child = Children.toArray(children).find(isValidElement);
  const className = child && isValidElement<{ className?: string }>(child) ? child.props.className : "";
  const language = className?.match(/language-([\w+#.-]+)/)?.[1] ?? "code";
  async function copy() {
    try {
      await navigator.clipboard.writeText(ref.current?.textContent ?? "");
      setCopied(true); setTimeout(() => setCopied(false), 1800);
    } catch { setCopied(false); }
  }
  return <div className="code-block"><div className="code-header"><span>{language}</span><button onClick={copy} aria-label="Copy code">{copied ? <Check size={13} /> : <Copy size={13} />}{copied ? "Copied" : "Copy code"}</button></div><pre ref={ref}>{children}</pre></div>;
}

export function MessageMarkdown({ content }: { content: string }) {
  return <div className="markdown"><Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={{
    pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
    a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
    img: ({ alt }) => <span>[Image: {alt || "image"}]</span>,
  }}>{content}</Markdown></div>;
}
