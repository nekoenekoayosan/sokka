import { supabaseBrowser } from "./supabase-browser";

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const session = supabaseBrowser
    ? (await supabaseBrowser.auth.getSession()).data.session
    : null;

  const headers = new Headers(options.headers);
  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  return fetch(url, { ...options, headers });
}
