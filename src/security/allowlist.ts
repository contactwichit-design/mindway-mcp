import path from "path";
import { CONFIG } from "../config.js";

export class SecurityCheck {
  static validateRelativePath(filePath: string): { valid: boolean; reason?: string; normalizedPath?: string } {
    if (!filePath || typeof filePath !== "string") {
      return { valid: false, reason: "Path must be a non-empty string." };
    }

    // Decode URI components & check for null bytes
    let decoded = filePath;
    try {
      decoded = decodeURIComponent(filePath);
    } catch {
      return { valid: false, reason: "Invalid URI encoding in file path." };
    }

    if (decoded.includes("\0") || decoded.includes("\u0000")) {
      return { valid: false, reason: "Null byte injection strictly blocked." };
    }

    const trimmed = decoded.trim();

    if (trimmed.includes("..") || trimmed.startsWith("/") || path.isAbsolute(trimmed)) {
      return { valid: false, reason: "Path traversal or absolute paths are strictly blocked." };
    }

    const normalized = path.normalize(trimmed).replace(/\\/g, "/");

    const segments = normalized.split("/");
    for (const seg of segments) {
      if (seg.startsWith(".") && seg !== ".") {
        return { valid: false, reason: "Hidden files or dot directories are strictly blocked." };
      }
    }

    const secretKeywords = ["env", "secret", "password", "key", "credential", "private", "token", "id_rsa", "pem", "p12"];
    const lowerName = path.basename(normalized).toLowerCase();
    for (const kw of secretKeywords) {
      if (lowerName.includes(kw)) {
        return { valid: false, reason: "Access to sensitive or secret files is strictly blocked." };
      }
    }

    const ext = path.extname(normalized).toLowerCase();
    if (!CONFIG.ALLOWED_EXTENSIONS.includes(ext)) {
      return { valid: false, reason: `File extension '${ext}' is not in the allowlist (${CONFIG.ALLOWED_EXTENSIONS.join(", ")}).` };
    }

    return { valid: true, normalizedPath: normalized };
  }

  static validateContentSize(contentLengthBytes: number): { valid: boolean; reason?: string } {
    if (contentLengthBytes > CONFIG.MAX_FILE_SIZE_BYTES) {
      return {
        valid: false,
        reason: `File size (${contentLengthBytes} bytes) exceeds maximum limit of ${CONFIG.MAX_FILE_SIZE_BYTES} bytes.`
      };
    }
    return { valid: true };
  }
}
