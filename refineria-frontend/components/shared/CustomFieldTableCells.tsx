'use client';

import type { CustomFieldDefinition } from '@/types';

interface Props {
  definitions: CustomFieldDefinition[];
  customFields: Record<string, string | null>;
}

export default function CustomFieldTableCells({ definitions, customFields }: Props) {
  if (definitions.length === 0) return null;

  return (
    <>
      {definitions.map((def) => (
        <td key={def.id} className="px-4 sm:px-5 py-3.5 whitespace-nowrap text-sm text-slate-400">
          {customFields[def.fieldName] ?? '—'}
        </td>
      ))}
    </>
  );
}

export function CustomFieldTableHeaders({ definitions }: { definitions: CustomFieldDefinition[] }) {
  if (definitions.length === 0) return null;

  return (
    <>
      {definitions.map((def) => (
        <th key={def.id} className="px-4 sm:px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
          {def.fieldName.replace(/_/g, ' ')}
        </th>
      ))}
    </>
  );
}
