import fs from 'fs';
import path from 'path';

export function loadPrompt(promptPath: string, replacements: Record<string, string> = {}): string {
  const content = fs.readFileSync(promptPath, 'utf-8');

  return Object.entries(replacements).reduce(
    (text, [key, value]) => text.replace(new RegExp(`{{${key}}}`, 'g'), value),
    content
  );
}

export function createPromptLoader(promptsDir: string) {
  return (filename: string, replacements: Record<string, string> = {}) =>
    loadPrompt(path.join(promptsDir, filename), replacements);
}
