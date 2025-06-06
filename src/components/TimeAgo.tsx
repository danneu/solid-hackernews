import { untrack, type Component } from "solid-js";

export function timeAgo(unix: number, now: number = Date.now() / 1000): string {
  const seconds = Math.floor(now - unix);
  if (seconds < 60) return `just now`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}hr ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const TimeAgo: Component<{ unix: number }> = (props) => {
  const date = new Date(untrack(() => props.unix) * 1000);
  return (
    <time
      datetime={date.toISOString()}
      // show user-friendly date string on hover
      title={date.toLocaleString()}
      style={{ "text-decoration": "dotted underline", cursor: "help" }}
    >
      {timeAgo(props.unix)}
    </time>
  );
};

export default TimeAgo;
