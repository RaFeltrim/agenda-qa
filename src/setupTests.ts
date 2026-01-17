import '@testing-library/jest-dom';

// Mock environment variables for testing
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.API_KEY = 'test-api-key';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.aistudio for AI key handling
Object.defineProperty(window, 'aistudio', {
  value: {
    hasSelectedApiKey: jest.fn().mockResolvedValue(true),
    openSelectKey: jest.fn().mockResolvedValue(undefined),
  },
  writable: true,
});

// Mock URL.createObjectURL and URL.revokeObjectURL
Object.defineProperty(window.URL, 'createObjectURL', {
  writable: true,
  value: jest.fn(),
});

Object.defineProperty(window.URL, 'revokeObjectURL', {
  writable: true,
  value: jest.fn(),
});

// Mock AudioContext
class MockAudioContext {
  decodeAudioData = jest.fn().mockResolvedValue({});
  createBufferSource = jest.fn().mockReturnValue({
    buffer: null,
    connect: jest.fn(),
    onended: null,
    start: jest.fn(),
  });
  destination = {};
}

Object.defineProperty(window, 'AudioContext', {
  value: MockAudioContext,
  writable: true,
});

Object.defineProperty(window, 'webkitAudioContext', {
  value: MockAudioContext,
  writable: true,
});
