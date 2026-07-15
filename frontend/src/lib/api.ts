const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchWithAuth(
  path: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any,
  options?: RequestInit,
): Promise<Response> {
  const accessToken = session?.accessToken as string | undefined

  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options?.headers,
    },
  })
}
