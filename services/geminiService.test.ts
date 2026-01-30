import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getLessonAudio } from './geminiService';
import 'fake-indexeddb/auto';
import { GoogleGenAI } from '@google/genai';

// Mock environment variables
vi.stubGlobal('import.meta', { env: { VITE_GEMINI_API_KEY: 'test-api-key' } });

// Mock GoogleGenAI
const generateContentMock = vi.fn();
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      apiKey: any;
      constructor(params: any) {
        this.apiKey = params.apiKey;
      }
      models = {
        generateContent: generateContentMock,
      };
    },
    Type: {},
    Modality: { AUDIO: 'audio' },
  };
});

describe('getLessonAudio Performance & Caching', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Clear IndexedDB
    const databases = await indexedDB.databases();
    for (const db of databases) {
      if (db.name) indexedDB.deleteDatabase(db.name);
    }
  });

  it('should use cache for subsequent calls', async () => {
    // Setup mock response
    generateContentMock.mockResolvedValue({
      candidates: [{ content: { parts: [{ inlineData: { data: 'base64audio' } }] } }],
    });

    const text = 'Hello world';

    // First call - should hit API
    const result1 = await getLessonAudio(text);
    expect(result1).toBe('base64audio');

    // Second call - should hit cache
    const result2 = await getLessonAudio(text);
    expect(result2).toBe('base64audio');

    // With caching, we expect 1 call
    expect(generateContentMock).toHaveBeenCalledTimes(1);
  });
});
