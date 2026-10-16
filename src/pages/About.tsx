import { useSeoMeta } from '@unhead/react';
import {
  Search, Zap, Globe, Database, ArrowRight, Lock, Code,
  ExternalLink, BookOpen, Newspaper, Shield, Layers, Gem, Users, FileText,
} from 'lucide-react';

import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function About() {
  useSeoMeta({
    title: 'About - 0xSearchstr',
    description: 'Learn about 0xSearchstr — the community-driven, Nostr-native fork of 0xSearchstr with Presearch-style keyword staking. Nostr-first, with SearXNG, Wikipedia, Hacker News, and Tor fallback.',
  });