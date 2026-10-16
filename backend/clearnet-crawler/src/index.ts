/**
 * 0xSearchstr Clearnet Crawler
 *
 * Polite web crawler that:
 * - Respects robots.txt for every domain
 * - Rate-limits requests per domain (configurable)
 * - Seeds from curated seed URLs + sitemap discovery
 * - Extracts text, title, meta description from HTML
 * - Runs content policy checks before indexing
 * - Pushes normalized documents to Meilisearch
 */

import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import * as cheerio from 'cheerio';
import robotsParser from 'robots-parser';
import PQueue from 'p-queue';
import { createLogger } from '../shared/src/logger.js';
import { indexDocuments, getSearchIndex } from '../shared/src/meili.js';
import { checkContentPolicy } from '../shared/src/content-policy.js';
import type { SearchDocument, CrawlerStatus } from '../shared/src/types.js';