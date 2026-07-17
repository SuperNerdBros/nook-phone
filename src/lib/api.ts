// api.ts
// Handles integration with WordPress REST API for PRO accounts (logged-in users)

declare global {
  interface Window {
    wpApiSettings?: {
      root: string;
      nonce: string;
      pluginUrl: string;
      userId?: number;
    };
  }
}

export const isProUser = (): boolean => {
  return typeof window !== 'undefined' && !!window.wpApiSettings && !!window.wpApiSettings.userId && window.wpApiSettings.userId > 0;
};

export const getApiHeaders = () => {
  if (!isProUser()) return {};
  return {
    'X-WP-Nonce': window.wpApiSettings!.nonce,
    'Content-Type': 'application/json'
  };
};

export const getApiUrl = (endpoint: string) => {
  if (!isProUser()) return '';
  return `${window.wpApiSettings!.root}xophz/v1/nook-phone/${endpoint}`;
};

export const fetchPassports = async () => {
  if (!isProUser()) return [];
  try {
    const res = await fetch(getApiUrl('passports'), { headers: getApiHeaders() });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch passports', e);
    return [];
  }
};

export const linkPassport = async (passportData: any) => {
  if (!isProUser()) return false;
  try {
    const res = await fetch(getApiUrl('passport/link'), {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({ passport: passportData })
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to link passport', e);
    return false;
  }
};

export const fetchApps = async () => {
  if (!isProUser()) return [];
  try {
    const res = await fetch(getApiUrl('apps'), { headers: getApiHeaders() });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch apps', e);
    return [];
  }
};

export const rateApp = async (appSlug: string, rating: number, comment: string = '') => {
  if (!isProUser()) return false;
  try {
    const res = await fetch(getApiUrl('rate'), {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({ app_slug: appSlug, rating, comment })
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to rate app', e);
    return false;
  }
};

export const installAppTracker = async (appSlug: string) => {
  if (!isProUser()) return false;
  try {
    const res = await fetch(getApiUrl('install'), {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({ app_slug: appSlug })
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to record install', e);
    return false;
  }
};

export const fetchThreads = async () => {
  if (!isProUser()) return [];
  try {
    const res = await fetch(getApiUrl('threads'), { headers: getApiHeaders() });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch threads', e);
    return [];
  }
};

export const createThread = async (title: string, content: string) => {
  if (!isProUser()) return null;
  try {
    const res = await fetch(getApiUrl('threads'), {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({ title, content })
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('Failed to create thread', e);
    return null;
  }
};

export const fetchComments = async (threadId: number) => {
  if (!isProUser()) return [];
  try {
    const root = window.wpApiSettings!.root;
    const res = await fetch(`${root}wp/v2/comments?post=${threadId}&order=asc`, { headers: getApiHeaders() });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch comments', e);
    return [];
  }
};

export const createComment = async (threadId: number, content: string) => {
  if (!isProUser()) return false;
  try {
    const root = window.wpApiSettings!.root;
    const res = await fetch(`${root}wp/v2/comments`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({ post: threadId, content })
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to create comment', e);
    return false;
  }
};

export const fetchConversations = async () => {
  if (!isProUser()) return [];
  try {
    const res = await fetch(getApiUrl('dms/conversations'), { headers: getApiHeaders() });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch conversations', e);
    return [];
  }
};

export const fetchDirectMessages = async (userId: number) => {
  if (!isProUser()) return [];
  try {
    const res = await fetch(getApiUrl(`dms/${userId}`), { headers: getApiHeaders() });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch direct messages', e);
    return [];
  }
};

export const sendDirectMessage = async (recipientId: number, content: string) => {
  if (!isProUser()) return null;
  try {
    const res = await fetch(getApiUrl('dms/send'), {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({ recipient_id: recipientId, content })
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('Failed to send direct message', e);
    return null;
  }
};

export const fetchNookUsers = async () => {
  if (!isProUser()) return [];
  try {
    const res = await fetch(getApiUrl('users'), { headers: getApiHeaders() });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch nook users', e);
    return [];
  }
};

export const fetchRemoteState = async () => {
  if (!isProUser()) return null;
  try {
    const res = await fetch(getApiUrl('state'), { headers: getApiHeaders() });
    if (!res.ok) return null;
    const data = await res.json();
    return data.state || null;
  } catch (e) {
    console.error('Failed to fetch remote state', e);
    return null;
  }
};

export const saveRemoteState = async (state: any) => {
  if (!isProUser()) return false;
  try {
    const res = await fetch(getApiUrl('state'), {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({ state })
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to save remote state', e);
    return false;
  }
};
