/** A tiny highlighter for the showcase code: good enough for short TS/Python snippets. */

const KEYWORDS = new Set([
  "import", "from", "export", "const", "let", "async", "await", "return", "if", "else",
  "def", "function", "default", "new", "class",
]);

export type TokenKind = "kw" | "str" | "num" | "fn" | "type" | "com" | "dec" | "text";

const TOKEN_RE =
  /(\/\/.*|#.*)|("[^"]*"|'[^']*')|(@\w+)|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_]\w*\b)(?=\s*\()|(\b[A-Za-z_]\w*\b)|(\s+|.)/g;

export function tokenize(line: string): [TokenKind, string][] {
  return Array.from(line.matchAll(TOKEN_RE), (m) => {
    const [text, com, str, dec, num, fn, word] = m;
    const name = fn ?? word;
    const kind: TokenKind = com
      ? "com"
      : str
        ? "str"
        : dec
          ? "dec"
          : num
            ? "num"
            : name && KEYWORDS.has(name)
              ? "kw"
              : fn
                ? "fn"
                : word && /^[A-Z]/.test(word)
                  ? "type"
                  : "text";
    return [kind, text];
  });
}
