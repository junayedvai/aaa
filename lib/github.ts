const GITHUB_API = 'https://api.github.com';

function readEnv(name: string) {
  return process.env[name]?.trim() || '';
}

export const SITE_CONTENT_PATH = 'data/site-content.json';

export function hasGitHubConfig() {
  return Boolean(readEnv('GITHUB_OWNER') && readEnv('GITHUB_REPO') && readEnv('GITHUB_TOKEN'));
}

function getConfig() {
  const owner = readEnv('GITHUB_OWNER');
  const repo = readEnv('GITHUB_REPO');
  const token = readEnv('GITHUB_TOKEN');
  const branch = readEnv('GITHUB_BRANCH') || 'main';

  if (!owner || !repo || !token) {
    throw new Error('Missing GitHub configuration: GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN are required');
  }

  return { owner, repo, token, branch };
}

function buildHeaders(token: string) {
  return {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'User-Agent': 'GameHub-Market-Admin/1.0',
  };
}

export async function getFile(filePath: string) {
  const { owner, repo, token, branch } = getConfig();
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
  const response = await fetch(url, { headers: buildHeaders(token) });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`GitHub API error ${response.status}: ${errorBody}`);
  }

  return response.json();
}

export async function createFile(filePath: string, content: string, commitMessage: string, options: { isBase64?: boolean } = {}) {
  const { owner, repo, token, branch } = getConfig();
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}`;
  const encodedContent = options.isBase64 ? content : Buffer.from(content, 'utf-8').toString('base64');
  const response = await fetch(url, {
    method: 'PUT',
    headers: buildHeaders(token),
    body: JSON.stringify({ message: commitMessage, content: encodedContent, branch }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`GitHub API error ${response.status}: ${errorBody}`);
  }

  return response.json();
}

export async function updateFile(filePath: string, content: string, commitMessage: string, sha: string, options: { isBase64?: boolean } = {}) {
  const { owner, repo, token, branch } = getConfig();
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}`;
  const encodedContent = options.isBase64 ? content : Buffer.from(content, 'utf-8').toString('base64');
  const response = await fetch(url, {
    method: 'PUT',
    headers: buildHeaders(token),
    body: JSON.stringify({ message: commitMessage, content: encodedContent, sha, branch }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`GitHub API error ${response.status}: ${errorBody}`);
  }

  return response.json();
}