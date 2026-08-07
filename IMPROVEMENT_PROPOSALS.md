# Mindway MCP - Architectural Improvement Proposals (Version 2)

This document records nonessential enhancement proposals for future iterations beyond Version 1.

## 1. Shared Cache & State Persistence (Redis / Cloud Firestore)
- **Current State**: In-memory rate limiting and live upstream GitHub fetching.
- **Proposal**: Introduce Redis or Firestore for distributed rate limiting and response caching across multi-instance Cloud Run deployment.

## 2. GitHub Webhook Eviction
- **Current State**: TTL and live-upstream fetches.
- **Proposal**: Subscribe to GitHub push webhooks for `contactwichit-design/mindway` to invalidate cache instantly upon file updates.

## 3. Standards-Compliant OAuth 2.1 Authorization
- **Current State**: Version 1 is public and unauthenticated for Gemini Spark compatibility.
- **Proposal**: Add OAuth 2.1 Dynamic Client Registration and Bearer Token verification middleware when custom app client auth is enabled.

## 4. Advanced Search Indexing (FlexSearch / Algolia)
- **Current State**: Repository tree scanning and regex/substring snippet matching.
- **Proposal**: Pre-index public Markdown documents into an in-memory or vector search index for sub-millisecond full-text queries.
