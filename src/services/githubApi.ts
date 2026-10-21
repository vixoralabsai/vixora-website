import { GitHubRepo, GitHubTreeItem, GitHubCommit, GitHubBranch, GitHubRelease, TreeNode } from '../types/github';

const TOKEN_KEY = 'vixora_github_token';
const RECENT_REPOS_KEY = 'vixora_recent_repos';

export function getStoredToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredToken(token: string) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token.trim());
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {
    console.error('Failed to save token to localStorage', e);
  }
}

export function getRecentRepos(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_REPOS_KEY);
    if (!raw) return ['facebook/react', 'tailwindlabs/tailwindcss', 'shadcn-ui/ui'];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return ['facebook/react', 'tailwindlabs/tailwindcss', 'shadcn-ui/ui'];
  }
}

export function saveRecentRepo(fullRepo: string) {
  try {
    const current = getRecentRepos().filter(r => r.toLowerCase() !== fullRepo.toLowerCase());
    const updated = [fullRepo, ...current].slice(0, 10);
    localStorage.setItem(RECENT_REPOS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save recent repo', e);
  }
}

export function parseGitHubInput(input: string): { owner: string; repo: string } | null {
  if (!input) return null;
  const cleaned = input.trim().replace(/\.git$/, '').replace(/\/$/, '');
  
  // Pattern 1: https://github.com/owner/repo
  const webMatch = cleaned.match(/github\.com\/([^/]+)\/([^/]+)/i);
  if (webMatch) {
    return { owner: webMatch[1], repo: webMatch[2] };
  }

  // Pattern 2: git@github.com:owner/repo
  const sshMatch = cleaned.match(/github\.com:([^/]+)\/([^/]+)/i);
  if (sshMatch) {
    return { owner: sshMatch[1], repo: sshMatch[2] };
  }

  // Pattern 3: owner/repo
  const shortMatch = cleaned.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (shortMatch) {
    return { owner: shortMatch[1], repo: shortMatch[2] };
  }

  return null;
}

function getHeaders(customToken?: string): HeadersInit {
  const token = customToken || getStoredToken();
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchRepo(owner: string, repo: string, customToken?: string): Promise<GitHubRepo> {
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  const res = await fetch(url, { headers: getHeaders(customToken) });
  
  if (res.status === 403 || res.status === 429) {
    const remaining = res.headers.get('x-ratelimit-remaining');
    if (remaining === '0') {
      throw new Error('GitHub API rate limit reached. Please provide a Personal Access Token in Settings to continue.');
    }
    throw new Error('Access forbidden by GitHub. If this is a private repo, provide a token with repo access.');
  }
  
  if (res.status === 404) {
    throw new Error(`Repository "${owner}/${repo}" was not found. Please verify the owner and repo name.`);
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch repository (${res.status} ${res.statusText})`);
  }

  const data = await res.json();
  saveRecentRepo(`${owner}/${repo}`);
  return data;
}

export async function fetchRepoLanguages(owner: string, repo: string, customToken?: string): Promise<Record<string, number>> {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/languages`;
    const res = await fetch(url, { headers: getHeaders(customToken) });
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

export async function fetchRepoTree(owner: string, repo: string, branch: string, customToken?: string): Promise<GitHubTreeItem[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`;
  const res = await fetch(url, { headers: getHeaders(customToken) });
  
  if (!res.ok) {
    // If recursive tree fails (can happen if repo is huge), fallback to standard contents of root
    const fallbackUrl = `https://api.github.com/repos/${owner}/${repo}/contents?ref=${encodeURIComponent(branch)}`;
    const fallbackRes = await fetch(fallbackUrl, { headers: getHeaders(customToken) });
    if (!fallbackRes.ok) {
      throw new Error('Failed to fetch repository file tree');
    }
    const contents = await fallbackRes.json();
    return contents.map((item: any) => ({
      path: item.path,
      mode: '100644',
      type: item.type === 'dir' ? 'tree' : 'blob',
      sha: item.sha,
      size: item.size,
      url: item.url,
    }));
  }

  const data = await res.json();
  return data.tree || [];
}

export async function fetchFileContent(owner: string, repo: string, path: string, branch: string, customToken?: string): Promise<string> {
  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(branch)}/${path}`;
  const res = await fetch(rawUrl, {
    headers: customToken ? { Authorization: `Bearer ${customToken}` } : {},
  });

  if (res.ok) {
    return await res.text();
  }

  // Fallback to GitHub API blobs
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`;
  const apiRes = await fetch(apiUrl, { headers: getHeaders(customToken) });
  if (!apiRes.ok) {
    throw new Error(`Failed to load file contents for "${path}"`);
  }
  const data = await apiRes.json();
  if (data.content && data.encoding === 'base64') {
    // Clean base64 newlines before decoding
    const cleanBase64 = data.content.replace(/\s/g, '');
    try {
      return decodeURIComponent(
        atob(cleanBase64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch {
      return atob(cleanBase64);
    }
  }
  return data.content || '';
}

export async function fetchCommits(owner: string, repo: string, branch: string, customToken?: string): Promise<GitHubCommit[]> {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/commits?sha=${encodeURIComponent(branch)}&per_page=30`;
    const res = await fetch(url, { headers: getHeaders(customToken) });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchBranches(owner: string, repo: string, customToken?: string): Promise<GitHubBranch[]> {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/branches?per_page=50`;
    const res = await fetch(url, { headers: getHeaders(customToken) });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchReleases(owner: string, repo: string, customToken?: string): Promise<GitHubRelease[]> {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/releases?per_page=20`;
    const res = await fetch(url, { headers: getHeaders(customToken) });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchUserRepos(username: string, customToken?: string): Promise<GitHubRepo[]> {
  const url = `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=30`;
  const res = await fetch(url, { headers: getHeaders(customToken) });
  if (!res.ok) {
    throw new Error(`Failed to fetch repositories for user "${username}"`);
  }
  return await res.json();
}

/**
 * Transforms flat GitHub tree list into hierarchical TreeNodes
 */
export function buildTreeHierarchy(items: GitHubTreeItem[]): TreeNode[] {
  const root: TreeNode[] = [];
  const map = new Map<string, TreeNode>();

  // Sort items so folders come before files, and alphabetical
  const sorted = [...items].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'tree' ? -1 : 1;
    return a.path.localeCompare(b.path);
  });

  for (const item of sorted) {
    const parts = item.path.split('/');
    const name = parts[parts.length - 1];
    const node: TreeNode = {
      name,
      path: item.path,
      type: item.type,
      size: item.size,
      sha: item.sha,
      children: item.type === 'tree' ? [] : undefined,
    };

    map.set(item.path, node);

    if (parts.length === 1) {
      root.push(node);
    } else {
      const parentPath = parts.slice(0, -1).join('/');
      const parent = map.get(parentPath);
      if (parent && parent.children) {
        parent.children.push(node);
      } else {
        root.push(node);
      }
    }
  }

  return root;
}
