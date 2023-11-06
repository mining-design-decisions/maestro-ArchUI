import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import MainMenu from "./main_menu";
import Root from "./routes/root";
import Embeddings from "./routes/ml_models/embeddings";
import MLModels from "./routes/ml_models/ml_models";
import ClassifyIssues from "./routes/classify_issues";
import Settings from "./routes/settings";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Tags from "./routes/tags";
import Statistics from "./routes/statistics";
import Search from "./routes/search";
import { initConnectionSettings } from "./components/connectionSettings";

function App() {
  initConnectionSettings();

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Root />,
    },
    {
      path: "/ml-models/embeddings",
      element: <Embeddings />,
    },
    {
      path: "/ml-models/ml-models",
      element: <MLModels />,
    },
    {
      path: "/classify-issues",
      element: <ClassifyIssues />,
    },
    {
      path: "/statistics",
      element: <Statistics />,
    },
    {
      path: "/tags",
      element: <Tags />,
    },
    {
      path: "/search",
      element: <Search />,
    },
    {
      path: "/settings",
      element: <Settings />,
    },
  ]);

  return (
    <>
      <div className="dark:bg-slate-900 text-white min-h-screen">
        <MainMenu />
        <div className="pt-4">
          <RouterProvider router={router} />
        </div>
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
