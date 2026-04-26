export type RawFile = { name: string; content: string };

export type ProcessedFile = {
  name: string;
  original: string;
  optimized: string;
  originalBytes: number;
  optimizedBytes: number;
  error?: string;
};
