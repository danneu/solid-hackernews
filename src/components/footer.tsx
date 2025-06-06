import type { Component } from "solid-js";
import SolidSvg from "../assets/img/solid.svg?component-solid";
import GithubSvg from "../assets/img/github.svg?component-solid";
import styles from "../assets/css/styles.module.scss";

const Footer: Component = () => (
  <footer class={styles.footer}>
    <p>
      Built by danneu with{" "}
      <a
        href="https://solidjs.com"
        title="SolidJS logo"
        style={{ "vertical-align": "middle" }}
      >
        {/* <img src={solidSvg} alt="SolidJS logo" width={24} /> */}
        <SolidSvg width={24} height={24} />
      </a>
    </p>
    <p>
      Source code on{" "}
      <a
        href="https://github.com/danneu/solid-hacker-news"
        title="Github.com logo"
        style={{ "vertical-align": "middle" }}
      >
        <GithubSvg width={24} height={24} />
      </a>
    </p>
  </footer>
);

export default Footer;
