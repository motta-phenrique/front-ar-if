const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * Browser-side fetch wrapper. Sends/receives JSON, forwards the auth cookie and
 * turns non-2xx responses into thrown errors so TanStack Query can surface them.
 */
export async function apiFetch<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(body || `Requisição falhou (${res.status})`);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
