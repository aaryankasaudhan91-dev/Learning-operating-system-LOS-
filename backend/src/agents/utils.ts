/**
 * Shared utility functions for AI agents.
 */

export function sanitizeInput(input: string | undefined): string {
  if (!input) return "";
  return input.toString().replace(/[\x00-\x1F\x7F-\x9F]/g, "").substring(0, 500);
}

export function cleanAiResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("**") && cleaned.endsWith("**")) {
    cleaned = cleaned.substring(2, cleaned.length - 2).trim();
  }
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.substring(1, cleaned.length - 1).trim();
  }
  return cleaned;
}
