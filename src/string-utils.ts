/**
 * Escapes a string so that it can be safely used in an `echo "<string>"` command.
 *
 * @param {string} input - The input string to be escaped.
 * @returns {string} - The escaped string.
 */
export function escapeForEcho(input: string): string {
  // Escape backslashes and double quotes
  let escaped = input.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

  // Escape special characters
  const specialChars = ["$", "`", "!", "\n"];
  specialChars.forEach((char) => {
    const charEscaped = "\\" + char;
    escaped = escaped.split(char).join(charEscaped);
  });

  return escaped;
}
