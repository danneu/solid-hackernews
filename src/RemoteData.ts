export type RemoteData<T> =
  | { type: "loading"; id: number }
  | { type: "loaded"; id: number; data: T }
  | { type: "error"; id: number; error: string };

// Narrowing

export function isLoading<T>(
  data: RemoteData<T>
): { type: "loading"; id: number } | null {
  return data.type === "loading" ? data : null;
}

export function isLoaded<T>(
  data: RemoteData<T>
): { type: "loaded"; id: number; data: T } | null {
  return data.type === "loaded" ? data : null;
}

export function isError<T>(
  data: RemoteData<T>
): { type: "error"; id: number; error: string } | null {
  return data.type === "error" ? data : null;
}
