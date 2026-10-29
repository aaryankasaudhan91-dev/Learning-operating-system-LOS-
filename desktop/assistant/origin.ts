export function isTrustedDocument(actual: string, expected: string): boolean {
  try {
    const a = new URL(actual), b = new URL(expected);
    a.hash = ''; b.hash = '';
    // No arbitrary same-origin path, file, query or iframe privileges.
    return a.href === b.href;
  } catch { return false; }
}
