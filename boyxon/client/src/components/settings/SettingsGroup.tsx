import type { ReactNode } from 'react';
import { Card } from '../ui/Card';

interface Props {
  title: string;
  children: ReactNode;
}

export function SettingsGroup({ title, children }: Props) {
  return (
    <section>
      <h2 className="mb-2 px-1 text-sm font-semibold uppercase tracking-wide text-ink-300">{title}</h2>
      <Card className="divide-y divide-ink-line/60 overflow-hidden">{children}</Card>
    </section>
  );
}
