const fs = require('fs').promises;
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('Error: Missing OPENAI_API_KEY environment variable.');
  process.exit(1);
}

const configuration = new Configuration({ apiKey });
const openai = new OpenAIApi(configuration);

const POSTS_DIR = path.join(process.cwd(), 'posts');
const SUMMARIES_DIR = path.join(POSTS_DIR, 'summaries');
const MAX_CONTENT_CHARS = 15000;

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    console.error(`Unable to create directory ${dir}:`, err);
    process.exit(1);
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function addMissingAiFiles() {
  await ensureDir(SUMMARIES_DIR);

  let files;
  try {
    files = await fs.readdir(POSTS_DIR);
  } catch (err) {
    console.error('Unable to read posts directory:', err);
    process.exit(1);
  }

  const mdFiles = files.filter(f => f.endsWith('.md') && !f.endsWith('.ai-summary.md'));

  for (const file of mdFiles) {
    const name = path.basename(file, '.md');
    const summaryName = `${name}.ai-summary.md`;
    const summaryPath = path.join(SUMMARIES_DIR, summaryName);

    if (await fileExists(summaryPath)) {
      console.log(`Existing summary: ${summaryName}`);
      continue;
    }

    const filePath = path.join(POSTS_DIR, file);
    let content;
    try {
      content = await fs.readFile(filePath, 'utf8');
    } catch (err) {
      console.error(`Unable to read ${file}:`, err);
      continue;
    }

    if (content.length > MAX_CONTENT_CHARS) {
      console.warn(`Content too long for ${file}, truncating to ${MAX_CONTENT_CHARS} characters.`);
      content = content.slice(0, MAX_CONTENT_CHARS) + '\n\n...[Content truncated for summary]';
    }

    console.log(`Generating AI summary for ${file}...`);
    try {
      const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: `Provide a concise summary for the following blog post:\n\n${content}` }
        ],
        max_tokens: 200,
        temperature: 0.7
      });
      const summary = response.data.choices[0].message.content.trim();
      const output = `# AI-Generated Summary\n\n${summary}\n`;
      await fs.writeFile(summaryPath, output, 'utf8');
      console.log(`Created summary: ${summaryName}`);
    } catch (err) {
      console.error(`Error generating summary for ${file}:`, err);
    }
  }
}

addMissingAiFiles();