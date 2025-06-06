import { type Store } from "solid-js/store";

const ENDPOINT = "https://hacker-news.firebaseio.com/v0/";

export const ItemType = {
  job: "job",
  story: "story",
  comment: "comment",
  poll: "poll",
  pollopt: "pollopt",
} as const;

export type ItemType = (typeof ItemType)[keyof typeof ItemType];

export type ApiStory = {
  id: number;
  by: string;
  score: number;
  type: Extract<ItemType, "story" | "job" | "poll">;
  title: string;
  url?: string;
  kids?: number[];
  time: number;
  descendants: number;
  text?: string;
};

export type ApiComment = {
  id: number;
  deleted?: true;
  kids?: number[];
  by: string;
  text: string;
  type: Extract<ItemType, "comment">;
  time: number;
  descendants: number;
};

export async function fetchComment(
  id: number,
  { signal }: { signal?: AbortSignal }
): Promise<Store<ApiComment>> {
  return fetch(`${ENDPOINT}item/${id}.json`, { signal }).then((r) => r.json());
}

export async function fetchStory(
  id: number,
  { signal }: { signal?: AbortSignal }
): Promise<Store<ApiStory>> {
  return fetch(`${ENDPOINT}item/${id}.json`, { signal }).then((r) => r.json());
}

export async function fetchStories(
  type: "top" | "new" | "best" | "ask" | "show" | "job",
  { signal }: { signal?: AbortSignal }
): Promise<ApiStory["id"][]> {
  return fetch(`${ENDPOINT}${type}stories.json`, { signal }).then((r) =>
    r.json()
  );
}
