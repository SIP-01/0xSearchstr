/**
 * Crawler network — live kind 16919 heartbeat telemetry for Explore.
 *
 * Reads crawler heartbeats from the index relay pool (one replaceable event
 * per node; latest wins), returning live nodes, shard coverage (00–FF of
 * the indexstr sharding scheme), per-family counts, and self-reported
 * totals. Everything derives from the events themselves — there is no
 * hardcoded node registry; any crawler publishing valid heartbeats appears
 * automatically.
 *
 * Heartbeats are self-reported and unverified: useful for coverage/health
 * estimates, never a reputation input.
 */
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

import { queryRelayPool } from '@/lib/searchRelays';
import { getIndexRelayUrls } from '@/lib/appRelays';
import {
  HEARTBEAT_KIND,
  dedupeHeartbeats,
  isNodeLive,
  heartbeatFamily,
  sourceVersion,
  type HeartbeatFamily,
} from '@/lib/heartbeat';

export interface CrawlerNetworkStats {
  /** Live (fresh heartbeat) nodes, newest first. */
  liveNodes: ReturnType<typeof dedupeHeartbeats>;
  /** Distinct shards (00–FF) currently covered by live nodes. */
  shardsCovered: number;
  /** Total shards in the scheme (256). */
  shardCount: number;
  /** Live nodes per software family. */
  byFamily: Partial<Record<HeartbeatFamily, number>>;
  /** Live nodes per software generation (source tag version). */
  byVersion: Record<string, number>;
  /** Self-reported totals across live nodes (unverified, indicative only). */
  selfReported: { pagesIndexed: number; published: number; queueSize: number };
}

export function useCrawlerNetwork() {
  return useQuery<CrawlerNetworkStats>({
    queryKey: ['crawler-network'],
    queryFn: async ({ signal }) => {
      const settled = await queryRelayPool(
        getIndexRelayUrls(),
        [{ kinds: [HEARTBEAT_KIND], limit: 500 }],
        { signal, timeoutMs: 8000 },
      );

      const events: NostrEvent[] = [];
      for (const value of settled) events.push(...value);

      // Latest heartbeat per node pubkey; keep only live ones.
      const liveNodes = dedupeHeartbeats(events).filter((hb) => isNodeLive(hb));

      const byFamily: Partial<Record<HeartbeatFamily, number>> = {};
      const byVersion: Record<string, number> = {};
      const shards = new Set<string>();
      const selfReported = { pagesIndexed: 0, published: 0, queueSize: 0 };

      for (const hb of liveNodes) {
        const family = heartbeatFamily(hb.source);
        byFamily[family] = (byFamily[family] ?? 0) + 1;
        const ver = sourceVersion(hb.source);
        if (ver !== null) byVersion[`v${ver}`] = (byVersion[`v${ver}`] ?? 0) + 1;
        shards.add(hb.shard);
        selfReported.pagesIndexed += hb.stats.pagesIndexed;
        selfReported.published += hb.stats.published;
        selfReported.queueSize += hb.stats.queueSize;
      }

      return {
        liveNodes,
        shardsCovered: shards.size,
        shardCount: 256,
        byFamily,
        byVersion,
        selfReported,
      };
    },
    staleTime: 60_000,
    retry: 0,
  });
}
