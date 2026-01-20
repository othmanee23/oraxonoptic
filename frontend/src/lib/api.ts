const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
let activeStoreId = '';

const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_URL}${path}`;
  const method = (options.method || 'GET').toUpperCase();
  let xsrfToken = getCookie('XSRF-TOKEN');
  if (method !== 'GET' && method !== 'HEAD' && !xsrfToken) {
    await ensureCsrfCookie();
    xsrfToken = getCookie('XSRF-TOKEN');
  }
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
      ...(activeStoreId ? { 'X-Store-Id': activeStoreId } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = 'Request failed';
    let errors: Record<string, string[]> | undefined;
    try {
      const data = await response.json();
      if (data?.message) {
        message = data.message;
      }
      if (data?.errors && typeof data.errors === 'object') {
        errors = data.errors;
        const firstField = Object.keys(errors)[0];
        if (firstField && errors[firstField]?.[0]) {
          message = errors[firstField][0];
        }
      }
    } catch {
      // Ignore JSON parse errors.
    }
    const error = new Error(message);
    (error as Error & { status?: number }).status = response.status;
    (error as Error & { errors?: Record<string, string[]> }).errors = errors;
    throw error;
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

export function setActiveStoreId(storeId: string) {
  activeStoreId = storeId;
}

export async function ensureCsrfCookie(): Promise<void> {
  await fetch(`${API_URL}/sanctum/csrf-cookie`, {
    credentials: 'include',
  });
}
