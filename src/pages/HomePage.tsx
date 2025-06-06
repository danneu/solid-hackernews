import {
  createMemo,
  For,
  Index,
  Match,
  onCleanup,
  Show,
  Suspense,
  Switch,
  type Component,
} from "solid-js";
import { fetchStories, fetchStory, type ApiStory } from "../api";
import { A, createAsync, useLocation } from "@solidjs/router";
import { extractDomain } from "../util";
import TimeAgo from "../components/TimeAgo";
import styles from "../assets/css/styles.module.scss";

const StoryItem: Component<{ story: ApiStory }> = (props) => {
  const viewSummary = () => (
    <A href={`/stories/${props.story.id}`}>
      {(props.story.descendants ?? 0) + " replies"}
    </A>
  );

  return (
    <article class={styles.story}>
      <aside>
        <Switch>
          <Match when={props.story.type === "job"}>Hiring</Match>
          <Match when={true}>{viewSummary()}</Match>
        </Switch>
        <br />
        {props.story.score} pts
      </aside>
      <section>
        <header>
          <A href={props.story.url ?? `/stories/${props.story.id}`}>
            {props.story.title}
          </A>{" "}
          <Show when={props.story.url}>
            {(url) => <span>({extractDomain(url())})</span>}
          </Show>
        </header>
        <footer class={styles.byline}>
          submitted by <A href={`/users/${props.story.by}`}>{props.story.by}</A>{" "}
          {props.story.time && <TimeAgo unix={props.story.time} />}
        </footer>
      </section>
    </article>
  );
};

const PER_PAGE = 25;

const HomePage: Component = () => {
  // SolidJS Best Practice: AbortController created once at component mount
  // Unlike React, SolidJS components don't re-render, so this runs only once
  const abortController = new AbortController();
  const location = useLocation();

  // SolidJS Best Practice: Cleanup runs when component unmounts
  // Perfect for canceling in-flight requests
  onCleanup(() => {
    console.log("[HomePage] onCleanup");
    abortController.abort();
  });

  const page = () => {
    if (typeof location.query.page === "string") {
      const num = parseInt(location.query.page);
      if (Number.isNaN(num)) return 1;
      if (!Number.isInteger(num)) return 1;
      if (num < 1 || num > 500 / PER_PAGE) return 1;
      return num;
    }
    return 1;
  };

  const type = () => {
    if (location.pathname === "/newest") return "new";
    if (location.pathname === "/ask") return "ask";
    if (location.pathname === "/show") return "show";
    if (location.pathname === "/jobs") return "job";
    return "top";
  };

  // Using createAsync for initial fetch for the top-level Suspense
  const storyIds = createAsync(() =>
    fetchStories(type(), { signal: abortController.signal })
  );

  const paginatedStoryIds = createMemo(() => {
    const ids = storyIds();
    if (!ids) return [];

    const start = (page() - 1) * PER_PAGE;
    const end = start + PER_PAGE;
    return ids.slice(start, end);
  });

  // Each story gets its own createAsync resource so that each can
  // be wrapped in a Suspense boundary.
  const paginatedStories = createMemo(() => {
    return paginatedStoryIds().map((id) =>
      createAsync(() => fetchStory(id, { signal: abortController.signal }))
    );
  });

  return (
    // Top-level Suspense for initial data loading
    <Suspense fallback={<div>Loading...</div>}>
      <div class={styles.HomePage}>
        <ol>
          <For each={paginatedStories()}>
            {(storyResource) => (
              <li>
                {/* Individual Suspense boundaries for each story */}
                <Suspense
                  fallback={
                    <div style={{ height: "3rem" }}>Loading story...</div>
                  }
                >
                  <Show when={storyResource()}>
                    {(story) => <StoryItem story={story()} />}
                  </Show>
                </Suspense>
              </li>
            )}
          </For>
        </ol>
        <Show when={storyIds()?.length && storyIds()!.length > PER_PAGE}>
          <Pagination
            page={page()}
            totalPages={Math.ceil(storyIds()!.length / PER_PAGE)}
          />
        </Show>
      </div>
    </Suspense>
  );
};

const Pagination: Component<{ page: number; totalPages: number }> = (props) => {
  return (
    <div class={styles.pagination}>
      Page{" "}
      <Index each={Array.from({ length: props.totalPages })}>
        {(_, i) => (
          <>
            <A
              href={`?page=${i + 1}`}
              classList={{ active: props.page === i + 1 }}
            >
              {i + 1}
            </A>{" "}
          </>
        )}
      </Index>
    </div>
  );
};

export default HomePage;
