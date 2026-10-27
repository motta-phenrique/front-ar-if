import "server-only";
import { cookies } from "next/headers";

export async function serverFetch(path: string, init?: RequestInit) {
  const cookieHeader = (await cookies()).toString();

  return fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      cookie: cookieHeader,
      ...init?.headers,
    },
    cache: "no-store",
  });
}
