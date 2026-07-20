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
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('Failed to link passport', e);
    return false;
  }
};
export const deletePassport = async (id: number | string) => {
  if (!isProUser()) return false;
  try {
    const res = await fetch(getApiUrl('passport/delete'), {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({ id })
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.success;
  } catch (e) {
    console.error('Failed to delete passport', e);
    return false;
  }
};
export const fetchApps = async () => {
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
  try {
    let deviceUuid = localStorage.getItem('nookos_uuid');
    if (!deviceUuid) {
      deviceUuid = crypto.randomUUID();
      localStorage.setItem('nookos_uuid', deviceUuid);
    }
    const res = await fetch(getApiUrl('install'), {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({ app_slug: appSlug, uuid: deviceUuid })
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

export const createThread = async (title: string, content: string, subnook: string) => {
  if (!isProUser()) return null;
  try {
    const res = await fetch(getApiUrl('threads'), {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({ title, content, subnook })
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('Failed to create thread', e);
    return null;
  }
};

export const tipThread = async (threadId: number, amount: number = 25) => {
  if (!isProUser()) return null;
  try {
    const res = await fetch(getApiUrl('threads/tip'), {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({ thread_id: threadId, amount })
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('Failed to tip thread', e);
    return null;
  }
};

export const getBoardStatus = async (board: string) => {
  try {
    const res = await fetch(getApiUrl(`boards/status?board=${encodeURIComponent(board)}`), { headers: getApiHeaders() });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('Failed to get board status', e);
    return null;
  }
};

export const donateToBoard = async (board: string, amount: number) => {
  if (!isProUser()) return null;
  try {
    const res = await fetch(getApiUrl('boards/donate'), {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({ board, amount })
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('Failed to donate to board', e);
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

export const fetchPrivateLetters = async () => {
  if (!isProUser()) return [];
  try {
    const res = await fetch(getApiUrl('dms/all'), { headers: getApiHeaders() });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch private letters', e);
    return [];
  }
};

export const createPrivateLetter = async (recipientId: number, subject: string, content: string, stationeryId: string = 'airmail') => {
  if (!isProUser()) return null;
  try {
    const res = await fetch(getApiUrl('dms/send'), {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({ 
        subject,
        content, 
        recipient_id: recipientId, 
        stationery_id: stationeryId
      })
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('Failed to create private letter', e);
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

export const deleteDM = async (dmId: number) => {
  if (!isProUser()) return false;
  try {
    const res = await fetch(getApiUrl('dms/delete'), {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({ dm_id: dmId })
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to delete DM', e);
    return false;
  }
};

export const deleteConversation = async (partnerId: number) => {
  if (!isProUser()) return false;
  try {
    const res = await fetch(getApiUrl('dms/delete'), {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({ partner_id: partnerId })
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to delete conversation', e);
    return false;
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

export const fetchDIYRecipes = async () => {
  try {
    const root = window.wpApiSettings?.root || '/wp-json/';
    const res = await fetch(`${root}xophz/v1/nookipedia/recipes`);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch DIY recipes', e);
    return [];
  }
};

export const fetchDIYMaterials = async () => {
  try {
    const root = window.wpApiSettings?.root || '/wp-json/';
    const res = await fetch(`${root}xophz/v1/nookipedia/materials`);
    if (!res.ok) return {};
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch DIY materials', e);
    return {};
  }
};

export const fetchNookipediaItems = async () => {
  try {
    const root = window.wpApiSettings?.root || '/wp-json/';
    const res = await fetch(`${root}xophz/v1/nookipedia/items`);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch Nookipedia items', e);
    return [];
  }
};

export const searchNookipediaItems = async (query: string, category?: string) => {
  try {
    const root = window.wpApiSettings?.root || '/wp-json/';
    let url = `${root}xophz/v1/nookipedia/items?search=${encodeURIComponent(query)}`;
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    const res = await fetch(url);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error('Failed to search Nookipedia items', e);
    return [];
  }
};

export const fetchPatreonAuthUrl = async (returnUrl?: string) => {
  try {
    const root = window.wpApiSettings?.root || '/wp-json/';
    let url = `${root}xophz/v1/auth/patreon/nook-phone/url`;
    if (returnUrl) {
      url += `?return_url=${encodeURIComponent(returnUrl)}`;
    }
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.url || null;
  } catch (e) {
    console.error('Failed to fetch Patreon Auth URL', e);
    return null;
  }
};

export const fetchNookipediaVillagers = async () => {
  try {
    const root = window.wpApiSettings?.root || '/wp-json/';
    const res = await fetch(`${root}xophz/v1/nookipedia/villagers`);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch Nookipedia villagers', e);
    return [];
  }
};

export const spendGP = async (gpCost: number, itemName: string) => {
  const result = await processTransaction(-gpCost, `Purchased: ${itemName}`);
  return result.success;
};

export const processTransaction = async (amount: number, reason: string): Promise<{ success: boolean; newBalance?: number }> => {
  if (!isProUser()) {
    // Allow local/offline mode transactions to succeed optimistically
    return { success: true };
  }
  try {
    const root = window.wpApiSettings?.root || '/wp-json/';
    const res = await fetch(`${root}xp/v1/transaction`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({ amount, reason })
    });
    if (!res.ok) return { success: false };
    const data = await res.json();
    return { success: data.success, newBalance: data.balance };
  } catch (e) {
    console.error('Failed to process transaction', e);
    return { success: false };
  }
};

export const generateGeminiReply = async (prompt: string, systemInstruction: string): Promise<string> => {
  if (!isProUser()) {
    return "I'm offline right now, pthhpth!";
  }
  try {
    const root = window.wpApiSettings?.root || '/wp-json/';
    const res = await fetch(`${root}xophz/v1/gemini/generate`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({ prompt, system_instruction: systemInstruction })
    });
    if (!res.ok) return "Sorry, I can't reply right now!";
    const data = await res.json();
    return data.success ? data.text : "Sorry, my phone is acting up!";
  } catch (e) {
    console.error('Failed to generate Gemini reply', e);
    return "Uh oh, connection lost!";
  }
};
