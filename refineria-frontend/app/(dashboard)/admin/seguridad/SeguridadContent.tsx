'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

const components: Components = {
  h1: ({ children, ...props }) => {
    const isTitle = !String(props.node?.properties?.id ?? '') && !children?.toString().startsWith('##');
    return (
      <h1 className={`text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2 mb-4 ${isTitle ? '' : 'mt-8'}`}>
        {children}
      </h1>
    );
  },
  h2: ({ children }) => (
    <h2 className="text-base sm:text-lg font-bold text-gold-400 tracking-tight mt-10 mb-4 pb-2 border-b border-blue-500/10 flex items-center gap-2">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-bold text-slate-200 mt-6 mb-3 flex items-center gap-2">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-sm text-slate-300 leading-relaxed mb-4">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="space-y-2 mb-4">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="space-y-2 mb-4 list-decimal list-inside">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-sm text-slate-300 leading-relaxed flex items-start gap-2">
      <span className="text-blue-400 mt-0.5 shrink-0">▸</span>
      <span>{children}</span>
    </li>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-white">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="text-slate-400 italic">{children}</em>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-gold-500/40 pl-4 py-2 my-4 bg-midnight-800/40 text-slate-400 text-sm italic rounded-sm">
      {children}
    </blockquote>
  ),
  code: ({ children, className }) => {
    if (className) {
      return (
        <code className="block bg-midnight-800/80 border border-blue-500/10 p-4 rounded-sm text-xs font-mono text-slate-300 overflow-x-auto my-4">
          {children}
        </code>
      );
    }
    return (
      <code className="bg-blue-500/10 text-amber-400 px-1.5 py-0.5 rounded-sm text-xs font-mono">
        {children}
      </code>
    );
  },
  pre: ({ children }) => <>{children}</>,
  table: ({ children }) => (
    <div className="overflow-x-auto my-6 border border-blue-500/10 rounded-sm">
      <table className="min-w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-midnight-800/80 border-b border-blue-500/10">{children}</thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-blue-500/5">{children}</tbody>
  ),
  tr: ({ children, ...props }) => {
    const isHeader = props.node?.properties?.style === undefined;
    return (
      <tr className={isHeader ? '' : 'hover:bg-midnight-800/30 transition-colors terminal-row'}>{children}</tr>
    );
  },
  th: ({ children }) => (
    <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">
      {children}
    </th>
  ),
  td: ({ children }) => {
    const text = children?.toString() ?? '';
    const isGreen = text.includes('🟢');
    const isYellow = text.includes('🟡');
    const isRed = text.includes('🔴');
    let statusClass = '';
    if (isGreen) statusClass = 'text-emerald-400';
    else if (isYellow) statusClass = 'text-amber-400';
    else if (isRed) statusClass = 'text-red-400';
    return (
      <td className={`px-4 py-3 text-sm text-slate-300 whitespace-nowrap ${statusClass}`}>
        <span className="inline-flex items-center gap-1.5">
          {isGreen && <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />}
          {isYellow && <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />}
          {isRed && <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)] blink-warning" />}
          {children}
        </span>
      </td>
    );
  },
  hr: () => (
    <hr className="border-t border-blue-500/10 my-8" />
  ),
};

export default function SeguridadContent({ content }: { content: string }) {
  return (
    <div className="glass-panel backdrop-blur-md bg-midnight-900/50 border border-white/10 p-5 sm:p-8">
      <div className="prose-custom max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
