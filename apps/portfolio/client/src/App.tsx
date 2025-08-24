import { Routes, Route } from "react-router-dom";
import { MDXProvider } from "@mdx-js/react";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import BlogIndex from "./pages/BlogIndex";
import "./App.css";

const components = {
  // Let CSS handle the styling for MDX components
  // The prose class in index.css will style these automatically
};

function App() {
  return (
    <MDXProvider components={components}>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/blog/:slug" element={<Blog />} />
        </Routes>
      </Layout>
    </MDXProvider>
  );
}

export default App;
