import HnSvg from "../assets/img/hn.svg?component-solid";
import GithubSvg from "../assets/img/github.svg?component-solid";
import { A } from "@solidjs/router";
import type { Component } from "solid-js";
import styles from "../assets/css/styles.module.scss";

const NavBar: Component = () => {
  return (
    <header class={styles.navbar}>
      <section>
        <A href="/" class={styles.logo} title="app logo" aria-label="Home">
          <HnSvg width={24} height={24} />
        </A>
        <A href="/" class={styles.brand} activeClass="">
          Hacker News
        </A>
        <A href="/" end>
          Top
        </A>
        <A href="/newest">New</A>
        <A href="/ask">Ask</A>
        <A href="/show">Show</A>
        <A href="/jobs">Jobs</A>
      </section>
      <section>
        <A
          href="https://github.com/danneu/solid-hacker-news"
          title="github logo"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GithubSvg width={24} height={24} />
        </A>
      </section>
    </header>
  );
};

export default NavBar;
