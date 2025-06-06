import { A, createAsync, useParams } from "@solidjs/router";
import {
  createMemo,
  For,
  type JSX,
  onCleanup,
  Show,
  Suspense,
  type Component,
  createSignal,
  createEffect,
  batch,
} from "solid-js";
import {
  fetchComment,
  fetchStory,
  type ApiStory,
  type ApiComment,
} from "../api";
import { extractDomain, isElementInViewport, match } from "../util";
import UserSvg from "../assets/img/user.svg?component-solid";
import TimeAgo from "../components/TimeAgo";
import styles from "../assets/css/styles.module.scss";
import { createStore, produce } from "solid-js/store";
import type { RemoteData } from "../RemoteData";

function parseHtml(html: string): string {
  const parser = new DOMParser();
  // HN has a <p> tag on everything but the opening, so we get better
  // html if we prepend one before parsing.
  const doc = parser.parseFromString("<p>" + html, "text/html");
  return doc.body.innerHTML;
}

const StoryHeader: Component<{ story: ApiStory }> = (props) => {
  return (
    <div class={styles.storyInfo}>
      <h2 class={styles.title}>
        <Show when={props.story.url} fallback={props.story.title}>
          {(url) => (
            <>
              <a href={url()}>{props.story.title}</a>{" "}
              <small>({extractDomain(url())})</small>
            </>
          )}
        </Show>
      </h2>
      <div class={styles.byline} style={{ "margin-bottom": "1rem" }}>
        {props.story.score} points by{" "}
        <A href={`/users/${props.story.by}`}>
          <UserSvg width={18} height={18} />
          {props.story.by}
        </A>{" "}
        <Show when={props.story.time}>
          {(time) => <TimeAgo unix={time()} />}
        </Show>
      </div>
      <Show when={props.story.text}>
        {(text) => (
          <div class={styles.storyText} innerHTML={parseHtml(text())} />
        )}
      </Show>
    </div>
  );
};

const StoryPage: Component = () => {
  // StoryPage is recreated for each page, so we can use top-level AbortController
  const abortController = new AbortController();
  const params = useParams();

  onCleanup(() => {
    console.log("[StoryPage] onCleanup");
    abortController.abort();
  });

  // Using createAsync for initial fetch for top-level Suspense boundary
  const story = createAsync(() =>
    fetchStory(Number(params.id), { signal: abortController.signal })
  );

  // Global map of all comments being loaded
  const [comments, setComments] = createStore<
    Record<number, RemoteData<ApiComment>>
  >({});

  // Depth-first comment loading
  createEffect(() => {
    const s = story();
    if (s?.kids) {
      // Initialize top-level comments synchronously
      batch(() => {
        s.kids!.forEach((id) => {
          setComments(
            produce((prev) => {
              prev[id] = { id, type: "loading" };
            })
          );
        });
      });

      // Start depth-first loading from first comment
      if (s.kids.length > 0) {
        loadCommentChain([...s.kids]);
      }
    }
  });

  // Depth-first loading: loads each comment and its children before moving to siblings
  function loadCommentChain(queue: number[]) {
    if (queue.length === 0) return;

    const id = queue.shift()!;

    fetchComment(id, { signal: abortController.signal })
      .then((comment) => {
        setComments(
          produce((prev) => {
            prev[id] = { id, type: "loaded", data: comment };
          })
        );

        // Depth-first: Add children to front of queue so they load before siblings
        if (comment.kids && comment.kids.length > 0) {
          // Initialize children as loading
          comment.kids.forEach((kidId) => {
            setComments(
              produce((prev) => {
                prev[kidId] = { id: kidId, type: "loading" };
              })
            );
          });
          queue.unshift(...comment.kids);
        }

        // Continue with next in queue
        loadCommentChain(queue);
      })
      .catch((error) => {
        // Silently handle AbortError when navigating away
        if (error.name === "AbortError") {
          console.log(
            `[StoryPage] Comment ${id} request aborted (user navigated away)`
          );
          return;
        }

        // Handle actual errors
        setComments(
          produce((prev) => {
            prev[id] = { id, type: "error", error: error.message };
          })
        );
      });
  }

  // Run this once when story() transitions from undefined -> ApiStory
  const topLevelComments = createMemo(() => {
    const s = story();
    if (!s?.kids) return [];

    return s.kids.flatMap((id) => {
      const c = comments[id];
      // Filter out deleted comments
      if (c?.type === "loaded" && c.data.deleted) return [];
      return [c];
    });
  });

  return (
    // Top-level Suspense for initial story loading
    <Suspense fallback={<div>Loading story...</div>}>
      <div class={styles.StoryPage}>
        <Show when={story()}>
          {(story) => (
            <>
              <StoryHeader story={story()} />
              <hr />
              <Show
                when={story().descendants && story().descendants > 0}
                fallback={<p>(This story has no comments)</p>}
              >
                <For each={topLevelComments()}>
                  {(comment) => (
                    <CommentThread
                      comment={comment}
                      commentLookup={comments}
                      depth={0}
                    />
                  )}
                </For>
              </Show>
            </>
          )}
        </Show>
      </div>
    </Suspense>
  );
};

// Separate component for recursive comment rendering
const CommentThread: Component<{
  comment: RemoteData<ApiComment> | undefined;
  commentLookup: Record<number, RemoteData<ApiComment>>;
  depth: number;
}> = (props) => {
  const [collapsed, setCollapsed] = createSignal(false);

  const childComments = createMemo(() => {
    if (
      props.comment?.type === "loaded" &&
      Array.isArray(props.comment.data.kids)
    ) {
      return props.comment.data.kids.flatMap((kid) => {
        const c = props.commentLookup[kid];
        // Filter deleted comments
        if (c?.type === "loaded" && c.data.deleted) return [];
        return [c];
      });
    }
    return [];
  });

  const handleCollapse: JSX.EventHandler<HTMLElement, MouseEvent> = (e) => {
    setCollapsed(true);
    // Only scroll if needed
    if (!isElementInViewport(e.currentTarget)) {
      e.currentTarget.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Show when={props.comment}>
      {(comment) => (
        <Show
          when={comment().type === "loading"}
          fallback={
            <Show
              when={match(comment(), (c) => c.type === "loaded" && c.data)}
              fallback={<p>Failed to load comment {comment().id}</p>}
            >
              {(data) => (
                <Show when={!data().deleted}>
                  <div class={`${styles.comment} comment-${data().id}`}>
                    <header class={styles.byline} id={`comment-${data().id}`}>
                      <A href={`/users/${data().by}`}>
                        <UserSvg width={18} height={18} />
                        {data().by}
                      </A>{" "}
                      <Show when={data().time}>
                        {(time) => (
                          <A href={`#comment-${data().id}`}>
                            <TimeAgo unix={time()} />
                          </A>
                        )}
                      </Show>
                    </header>
                    <Show when={data().text}>
                      {(text) => <div innerHTML={parseHtml(text())} />}
                    </Show>
                    <Show when={childComments().length > 0}>
                      <footer class={styles.commentReplies}>
                        <div
                          class={`${styles.gutter} gutter-depth-${
                            props.depth % 3
                          }`}
                          onClick={handleCollapse}
                        />
                        <Show
                          when={!collapsed()}
                          fallback={
                            <button onClick={() => setCollapsed(false)}>
                              Show {childComments().length} replies
                            </button>
                          }
                        >
                          <ul>
                            <For each={childComments()}>
                              {(child) => (
                                <li>
                                  <CommentThread
                                    comment={child}
                                    commentLookup={props.commentLookup}
                                    depth={props.depth + 1}
                                  />
                                </li>
                              )}
                            </For>
                          </ul>
                        </Show>
                      </footer>
                    </Show>
                  </div>
                </Show>
              )}
            </Show>
          }
        >
          <p>Loading comment {comment().id}...</p>
        </Show>
      )}
    </Show>
  );
};

export default StoryPage;
