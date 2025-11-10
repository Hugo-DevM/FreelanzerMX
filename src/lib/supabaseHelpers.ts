// Helper para manejar rate limiting y reintentos
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Si es error 429 (rate limit), esperar más tiempo
      if (error.status === 429 || error.code === 'PGRST301') {
        const waitTime = delay * Math.pow(2, i); // Exponential backoff
        console.warn(`Rate limited. Retrying in ${waitTime}ms... (attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      // Si es otro error, lanzarlo inmediatamente
      throw error;
    }
  }
  
  throw lastError;
}

// Helper para verificar si hay rate limiting
export function isRateLimitError(error: any): boolean {
  return error?.status === 429 || 
         error?.code === 'PGRST301' || 
         error?.message?.toLowerCase().includes('rate limit') ||
         error?.message?.toLowerCase().includes('too many requests');
}

