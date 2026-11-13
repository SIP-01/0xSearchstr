import type { ReactNode } from 'react';
import { Layers, Zap, Globe, Shield, Network, BookOpen, Newspaper, Code, Database } from 'lucide-react';
import type { SearchSource } from '@/lib/providers/types';

export type SourceTabValue = SearchSource | 'all' | 'index' | 'i2p';

export interface SourceTabMeta {
  id: SourceTabValue;
  label: string;
  icon: ReactNode;
  color: string;
  activeColor: string;
}

export const ALL_SOURCE_TABS: SourceTabMeta[] = [
  { id: 'web', label: 'Web', icon: <Globe className="w-3.5 h-3.5" />, color: 'text-muted-foreground/70 hover:text-foreground', activeColor: 'text-[var(--primary)] bg-[var(--primary)]/10 border-[var(--primary)]/30' },
  { id: 'index', label: 'Index', icon: <Database className="w-3.5 h-3.5" />, color: 'text-muted-foreground/70 hover:text-foreground', activeColor: 'text-[var(--primary)] bg-[var(--primary)]/10 border-[var(--primary)]/30' },
  { id: 'all', label: 'All', icon: <Layers className="w-3.5 h-3.5" />, color: 'text-muted-foreground/70 hover:text-foreground', activeColor: 'text-[var(--primary)] bg-[var(--primary)]/10 border-[var(--primary)]/30' },
  { id: 'nostr', label: 'Nostr', icon: <Zap className="w-3.5 h-3.5" />, color: 'text-muted-foreground/70 hover:text-foreground', activeColor: 'text-[var(--primary)] bg-[var(--primary)]/10 border-[var(--primary)]/30' },
  { id: 'wiki', label: 'Wiki', icon: <BookOpen className="w-3.5 h-3.5" />, color: 'text-muted-foreground/70 hover:text-foreground', activeColor: 'text-[var(--primary)] bg-[var(--primary)]/10 border-[var(--primary)]/30' },
  { id: 'news', label: 'News', icon: <Newspaper className="w-3.5 h-3.5" />, color: 'text-muted-foreground/70 hover:text-foreground', activeColor: 'text-[var(--primary)] bg-[var(--primary)]/10 border-[var(--primary)]/30' },
  { id: 'code', label: 'Code', icon: <Code className="w-3.5 h-3.5" />, color: 'text-muted-foreground/70 hover:text-foreground', activeColor: 'text-[var(--primary)] bg-[var(--primary)]/10 border-[var(--primary)]/30' },
  { id: 'tor', label: 'Tor', icon: <Shield className="w-3.5 h-3.5" />, color: 'text-muted-foreground/70 hover:text-foreground', activeColor: 'text-[var(--primary)] bg-[var(--primary)]/10 border-[var(--primary)]/30' },
  { id: 'i2p', label: 'I2P', icon: <Network className="w-3.5 h-3.5" />, color: 'text-muted-foreground/70 hover:text-foreground', activeColor: 'text-[var(--primary)] bg-[var(--primary)]/10 border-[var(--primary)]/30' },
];

export const DEFAULT_TAB_CONFIG = {
  order: ALL_SOURCE_TABS.map((tab) => tab.id) as string[],
  hidden: ['tor', 'i2p'],
  defaultTab: 'web',
};
