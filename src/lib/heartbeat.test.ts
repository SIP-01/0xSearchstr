import { describe, it, expect } from 'vitest';

import {
  HEARTBEAT_KIND,
  HEARTBEAT_TTL_S,
  parseHeartbeat,
  dedupeHeartbeats,
  isNodeLive,
  heartbeatFamily,
  sourceVersion,
} from './heartbeat';
import type { NostrEvent } from '@nostrify/nostrify';

function makeHeartbeat(overrides: {
  pubkey?: string;
  createdAt?: number;
  content?: string;
  source?: string;
} = {}): NostrEvent {
  return {
    id: 'hb' + Math.random().toString(16).slice(2),
    pubkey: overrides.pubkey ?? 'aa'.repeat(32),
    created_at: overrides.createdAt ?? Math.floor(Date.now() / 1000),
    kind: HEARTBEAT_KIND,
    tags: [
      ['d', 'heartbeat'],
      ...(overrides.source ? [['source', overrides.source] as string[]] : []),
    ],
    content: overrides.content ?? JSON.stringify({
      v: '2',
      shard: '3f',
      platform: 'web',
      network: 'clearnet',
      charging: true,
      stats: { pagesIndexed: 120, queueSize: 5, published: 118 },
    }),
    sig: '',
  };
}

describe('parseHeartbeat', () => {
  it('parses a well-formed indexstr-style heartbeat', () => {
    const hb = parseHeartbeat(makeHeartbeat({ source: 'indexstr/v2' }));
    expect(hb).not.toBeNull();
    expect(hb!.shard).toBe('3F'); // uppercased
    expect(hb!.v).toBe('2');
    expect(hb!.stats.pagesIndexed).toBe(120);
    expect(hb!.source).toBe('indexstr/v2');
    expect(hb!.charging).toBe(true);
  });

  it('rejects wrong kinds, bad JSON, and malformed shards', () => {
    expect(parseHeartbeat({ ...makeHeartbeat(), kind: 1 })).toBeNull();
    expect(parseHeartbeat(makeHeartbeat({ content: 'not json' }))).toBeNull();
    expect(parseHeartbeat(makeHeartbeat({ content: JSON.stringify({ v: '2', shard: 'xyz' }) }))).toBeNull();
  });

  it('clamps negative stats and caps field lengths', () => {
    const hb = parseHeartbeat(makeHeartbeat({
      content: JSON.stringify({
        v: '1', shard: '0a',
        platform: 'x'.repeat(50),
        stats: { pagesIndexed: -5, queueSize: 3, published: 1 },
      }),
    }));
    expect(hb!.stats.pagesIndexed).toBe(0);
    expect(hb!.platform.length).toBeLessThanOrEqual(16);
  });
});

describe('dedupe + liveness', () => {
  it('keeps only the latest heartbeat per node', () => {
    const now = Math.floor(Date.now() / 1000);
    const events = [
      makeHeartbeat({ createdAt: now - 600, content: JSON.stringify({ v: '1', shard: '01' }) }),
      makeHeartbeat({ createdAt: now - 10, content: JSON.stringify({ v: '2', shard: '02' }) }),
    ];
    const deduped = dedupeHeartbeats(events);
    expect(deduped).toHaveLength(1);
    expect(deduped[0].shard).toBe('02');
  });

  it('marks stale heartbeats offline after the TTL', () => {
    const now = Math.floor(Date.now() / 1000);
    const fresh = parseHeartbeat(makeHeartbeat({ createdAt: now - 60 }));
    const stale = parseHeartbeat(makeHeartbeat({ createdAt: now - HEARTBEAT_TTL_S - 5 }));
    expect(fresh && isNodeLive(fresh)).toBe(true);
    expect(stale && isNodeLive(stale)).toBe(false);
  });
});

describe('family + version classification', () => {
  it('classifies crawler families and generations from the source tag', () => {
    expect(heartbeatFamily('crawlstr/v3')).toBe('crawlstr');
    expect(heartbeatFamily('indexstr/v2')).toBe('indexstr');
    expect(heartbeatFamily(undefined)).toBe('unknown');
    expect(sourceVersion('crawlstr/v3')).toBe(3);
    expect(sourceVersion('indexstr/1')).toBe(1);
    expect(sourceVersion('unknown')).toBeNull();
  });
});
