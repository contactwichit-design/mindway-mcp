import { describe, it, expect } from "vitest";
import { SecurityCheck } from "../../src/security/allowlist.js";
import { RateLimiter } from "../../src/security/rate-limit.js";

describe("SecurityCheck Path Traversal & Allowlist", () => {
  it("blocks path traversal attempts with ..", () => {
    const res = SecurityCheck.validateRelativePath("../secret.md");
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("Path traversal");
  });

  it("blocks absolute paths", () => {
    const res = SecurityCheck.validateRelativePath("/etc/passwd");
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("Path traversal");
  });

  it("blocks secret file keywords", () => {
    const res = SecurityCheck.validateRelativePath("config/secrets.json");
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("sensitive or secret");
  });

  it("blocks disallowed extensions", () => {
    const res = SecurityCheck.validateRelativePath("script.sh");
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("not in the allowlist");
  });

  it("allows valid relative markdown files", () => {
    const res = SecurityCheck.validateRelativePath("my.md");
    expect(res.valid).toBe(true);
    expect(res.normalizedPath).toBe("my.md");
  });

  it("allows valid nested markdown files", () => {
    const res = SecurityCheck.validateRelativePath("docs/guide.md");
    expect(res.valid).toBe(true);
    expect(res.normalizedPath).toBe("docs/guide.md");
  });

  it("blocks files exceeding max size limit", () => {
    const res = SecurityCheck.validateContentSize(2 * 1024 * 1024);
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("exceeds maximum limit");
  });
});

describe("RateLimiter", () => {
  it("allows requests under the limit and tracks count", () => {
    const testIp = "192.168.1.100";
    const res = RateLimiter.check(testIp);
    expect(res.allowed).toBe(true);
    expect(res.remaining).toBeLessThan(100);
  });
});
