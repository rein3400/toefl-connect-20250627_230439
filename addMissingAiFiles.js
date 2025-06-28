import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { Configuration, OpenAIApi } from 'openai';

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error('Error: OPENAI_API_KEY not set in environment.');
  process.exit(1);
}

const configuration = new Configuration({ apiKey: API_KEY });
const openai = new OpenAIApi(configuration);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const postsDir = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.resolve(__dirname, 'blog');
const aiDir = process.argv[3]
  ? path.resolve(process.cwd(), process.argv[3])
  : path.resolve(__dirname, 'ai');

async function getMarkdownFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(entry => {
      const res = path.resolve(dir, entry.name);
      if (entry.isDirectory()) return getMarkdownFiles(res);
      if (entry.isFile() && path.extname(entry.name).toLowerCase() === '.md') return [res];
      return [];
    })
  );
  return files.flat();
}

async function ensureDirectory(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function generateSummary(text) {
  const maxContentLength = 3000;
  const truncated = text.length > maxContentLength ? text.slice(0, maxContentLength) : text;
  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a helpful assistant that generates concise summaries of blog posts.' },
      { role: 'user', content: `Summarize the following blog post in 2-3 sentences:\n\n${truncated}` }
    ],
    temperature: 0.7,
    max_tokens: 150
  });
  return response.data.choices[0].message.content.trim();
}

async function processFile(filePath) {
  const slug = path.basename(filePath, path.extname(filePath));
  const aiFilePath = path.join(aiDir, `${slug}.json`);

  let exists = true;
  try {
    await fs.access(aiFilePath);
  } catch (err) {
    if (err.code === 'ENOENT') {
      exists = false;
    } else {
      console.error(`Error checking existence of ${aiFilePath}:`, err);
      return;
    }
  }
  if (exists) {
    console.log(`Skipped (exists): ${aiFilePath}`);
    return;
  }

  const raw = await fs.readFile(filePath, 'utf-8');
  const { content } = matter(raw);

  try {
    const summary = await generateSummary(content);
    const data = {
      slug,
      summary,
      source: path.relative(process.cwd(), filePath),
      generatedAt: new Date().toISOString()
    };
    await fs.writeFile(aiFilePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    console.log(`Created: ${aiFilePath}`);
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
  }
}

async function main() {
  try {
    await fs.access(postsDir);
  } catch {
    console.error(`Posts directory not found: ${postsDir}`);
    process.exit(1);
  }
  await ensureDirectory(aiDir);
  const mdFiles = await getMarkdownFiles(postsDir);
  for (const file of mdFiles) {
    await processFile(file);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});