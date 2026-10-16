/**
 * 0xSearchstr NIP-50 Relay Proxy
 *
 * A lightweight Nostr relay that implements NIP-50 search filters.
 * When a client sends a REQ with a `search` field, this relay:
 * 1. Queries Meilisearch for matching documents
 * 2. Returns the original signed Nostr events from the index
 * 3. Sends EOSE when done
 *
 * This allows any existing Nostr client to query our search index
 * natively using standard NIP-01 + NIP-50 messages.
 *
 * Non-search REQs are rejected with a NOTICE.
 */

import { createServer, type IncomingMessage } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import { createLogger } from '../shared/src/logger.js';
import { searchIndex, getSearchIndex } from '../shared/src/meili.js';
import type { NostrEvent, SearchDocument } from '../shared/src/types.js';

const log = createLogger('nip50-relay');

const PORT = parseInt(process.env.NIP50_PORT || '7777', 10);
const HOST = process.env.NIP50_HOST || '0.0.0.0';
const MAX_LIMIT = parseInt(process.env.NIP50_MAX_LIMIT || '100', 10);

// ─── NIP-11 Relay Information Document ───
const RELAY_INFO = {
  name: '0xSearchstr NIP-50 Relay',
  description: 'Federated search relay powered by Meilisearch. Supports NIP-50 search filters across Nostr events indexed by 0xSearchstr.',
  pubkey: '',
  contact: '',
  supported_nips: [1, 11, 50],
  software: 'https://github.com/SIP-01/0xSearchstr',
  version: '0.1.0',
  limitation: {
    max_message_length: 65536,
    max_subscriptions: 10,
    max_filters: 5,
    max_limit: MAX_LIMIT,
    auth_required: false,
    payment_required: false,
  },
};