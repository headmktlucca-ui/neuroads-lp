import fs from 'fs';
import path from 'path';

const AGENTS_DIR = path.join(process.cwd(), '.agent', 'agents');

function stripFrontmatter(content: string): string {
  const frontmatterRegex = /^---[\s\S]*?---\n/;
  return content.replace(frontmatterRegex, '').trim();
}

export function loadAgentPrompt(slug: string): string | null {
  try {
    const filePath = path.join(AGENTS_DIR, `${slug}.md`);
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf-8');
    return stripFrontmatter(raw);
  } catch {
    return null;
  }
}

export function loadAllAgentPrompts(): Record<string, string> {
  const result: Record<string, string> = {};
  try {
    const files = fs.readdirSync(AGENTS_DIR).filter((f) => f.endsWith('.md'));
    for (const file of files) {
      const slug = file.replace('.md', '');
      const prompt = loadAgentPrompt(slug);
      if (prompt) result[slug] = prompt;
    }
  } catch {
    // agents dir missing or unreadable
  }
  return result;
}
