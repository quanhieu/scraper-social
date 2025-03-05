export const PREFIX_SEARCH = {
  REVIEW: 'review',
  TOP: 'top',
  UNBOXING: 'unboxing',
  UNBOX: 'unbox',
};

export const LOCALE = {
  VI: 'vi',
  EN: 'en',
  CN: 'cn',
  ZH: 'zh',
  JA: 'ja',
};

export const LOCALE_MAP = {
  [LOCALE.VI]: 'Vietnamese',
  [LOCALE.EN]: 'English',
  [LOCALE.CN]: 'Chinese',
  [LOCALE.ZH]: 'Chinese',
  [LOCALE.JA]: 'Japanese',
};

export const LLM_TYPE = {
  OPENROUTER: 'openrouter',
  GEMINI: 'gemini',
  OPENAI: 'openai',
  CHATGPT: 'chatgpt',
  ANTHROPIC: 'anthropic',
  CLAUDE: 'claude',
  DEEPSEEK: 'deepseek',
  HUGGINGFACE: 'huggingface',
  VLLM: 'vllm',
  MISTRAL: 'mistral',
};

// models = ['gpt-4o-mini', 'gemini-2.0-flash-lite', 'deepseek-chat'];

export const GEMINI_MODEL = {
  GEMINI_2_0_FLASH_LITE: 'gemini-2.0-flash-lite',
};

export const OPEN_AI_MODEL = {
  GPT_4O_MINI: 'gpt-4o-mini',
};

export const ANTHROPIC_MODEL = {
  CLAUDE_3_5_SONNET: 'claude-3-5-sonnet-20240620',
  CLAUDE_3_5_SONNET_20240620: 'claude-3-5-sonnet-20240620',
};

export const DEEPSEEK_MODEL = {
  DEEPSEEK_CHAT: 'deepseek-chat',
};

export const TYPE_INPUT = {
  YOUTUBE: 'youtube',
  TIKTOK: 'tiktok',
  WEBSITE: 'website',
  TEXT: 'text',
};

export function isValidUrl(input: string): URL | null {
  try {
    return new URL(input);
  } catch {
    return null;
  }
}

export function detectInputType(input: string): string {
  const url = isValidUrl(input);
  if (!url) {
    return TYPE_INPUT.TEXT;
  }

  const hostname = url.hostname.toLowerCase();

  const youtubeDomains = ['youtube.com', 'youtu.be'];
  const tiktokDomains = ['tiktok.com', 'vt.tiktok.com'];

  if (youtubeDomains.some((domain) => hostname.endsWith(domain))) {
    return TYPE_INPUT.YOUTUBE;
  }

  if (tiktokDomains.some((domain) => hostname.endsWith(domain))) {
    return TYPE_INPUT.TIKTOK;
  }

  return TYPE_INPUT.WEBSITE;
}

export function cleanNumericValue(value: string | number): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;

  return parseInt(value.toString().replace(/,/g, ''), 10) || 0;
}
