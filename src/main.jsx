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

  const prefix = "/archui";
  const router = createBrowserRouter([
    {
      path: `${prefix}/`,
      element: <Root />,
    },
    {
      path: `${prefix}/ml-models/embeddings`,
      element: <Embeddings />,
    },
    {
      path: `${prefix}/ml-models/ml-models`,
      element: <MLModels />,
    },
    {
      path: `${prefix}/classify-issues`,
      element: <ClassifyIssues />,
    },
    {
      path: `${prefix}/statistics`,
      element: <Statistics />,
    },
    {
      path: `${prefix}/tags`,
      element: <Tags />,
    },
    {
      path: `${prefix}/search`,
      element: <Search />,
    },
    {
      path: `${prefix}/settings`,
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
