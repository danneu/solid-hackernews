import { type RouteSectionProps } from "@solidjs/router";
import type { Component } from "solid-js";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import styles from "../assets/css/styles.module.scss";

const Layout: Component<RouteSectionProps<unknown>> = (props) => {
  return (
    <div>
      <NavBar />
      <main style={{ padding: "0 2em" }}>{props.children}</main>
      <div class={styles.spacer} />
      <Footer />
    </div>
  );
};

export default Layout;
