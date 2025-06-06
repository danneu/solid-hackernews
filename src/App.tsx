import "./assets/css/reset.css";
import { Route, Router } from "@solidjs/router";
import HomePage from "./pages/HomePage";
import Layout from "./pages/Layout";
import StoryPage from "./pages/StoryPage";

function App() {
  return (
    <Router root={Layout} base="/solid-hackernews">
      <Route path="/" component={HomePage} />
      <Route path="/newest" component={HomePage} />
      <Route path="/ask" component={HomePage} />
      <Route path="/show" component={HomePage} />
      <Route path="/jobs" component={HomePage} />
      <Route path="/stories/:id" component={StoryPage} />
    </Router>
  );
}

export default App;
