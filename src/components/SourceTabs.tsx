import { cn } from '@/lib/utils';
import { useAppContext } from '@/hooks/useAppContext';
import { ALL_SOURCE_TABS, type SourceTabMeta, type SourceTabValue } from '@/components/sourceTabs.config';

interface SourceTabsProps {
  value: SourceTabValue;
  onChange: (source: SourceTabValue) => void;
  className?: string;
  counts?: Partial<Record<SourceTabValue, number>>;
}

const TAB_BY_ID = new Map(ALL_SOURCE_TABS.map((tab) => [tab.id, tab]));

export function SourceTabs({ value, onChange, className, counts }: SourceTabsProps) {
  const { config } = useAppContext();
  const { order, hidden } = config.tabConfig;

  const visible = [
    ...order.filter((id) => !hidden.includes(id)),
    ...ALL_SOURCE_TABS.map((tab) => tab.id as string).filter((id) => !order.includes(id) && !hidden.includes(id)),
  ]
    .map((id) => TAB_BY_ID.get(id as SourceTabValue))
    .filter((tab): tab is SourceTabMeta => tab !== undefined);

  const sources = visible.length > 0
    ? [...visible]
    : ALL_SOURCE_TABS.filter((tab) => tab.id === 'web' || tab.id === 'all');

  if (!sources.some((tab) => tab.id === value)) {
    const active = TAB_BY_ID.get(value);
    if (active) sources.push(active);
  }

  return (
    <div className={cn('flex items-center gap-1.5 flex-wrap', className)} role="tablist" aria-label="Search source">
      {sources.map((source) => {
        const isActive = value === source.id;
        const count = counts?.[source.id];
        return (
          <button
            key={source.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(source.id)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-transparent transition-all duration-150',
              isActive ? source.activeColor : cn('text-muted-foreground', source.color),
              !isActive && 'hover:bg-accent',
            )}
          >
            {source.icon}
            {source.label}
            {count !== undefined && count > 0 && (
              <span className={cn(
                'text-[10px] font-mono ml-0.5 opacity-70',
                isActive ? '' : 'text-muted-foreground',
              )}>
                {count > 99 ? '99+' : count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
