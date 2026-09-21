export function getErrorSummary(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  }

  if (typeof error === 'string') {
    return { message: error };
  }

  return {
    message: 'Unknown error',
    raw: error,
  };
}

export function safeJsonParse<T = Record<string, unknown>>(text: string): T | null {
  if (!text || !text.trim()) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export function shouldRetry(statusCode: number): boolean {
  return statusCode >= 500 || statusCode === 429 || statusCode === 408;
}
