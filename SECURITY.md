# Security Policy & Threat Model

## Threat Model & Boundaries
- **Scope**: Version 1 is public, read-only context retrieval for Mindway protocol documentation.
- **Data Boundaries**: Restricts all file access strictly to `contactwichit-design/mindway` public repository.
- **Blocked Access**: No access to Google Drive, Gmail, private repositories, shell commands, or arbitrary external URLs.
- **Path Traversal Protection**: Rejects all path navigation containing `..`, leading slashes `/`, hidden files `.env`, `.git`, or credential files.
- **Secrets Policy**: No API tokens, SSH keys, or secrets are stored in code or returned in responses.
- **Rate Limiting**: In-memory rate limiting enforces a maximum of 100 requests per minute per IP address.
