import React from "react";
import ReactDOM from "react-dom/client";
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./styles.css";
import ContentEditor from "./cms/ContentEditor.jsx";
import ContentList from "./cms/ContentList.jsx";
import MediaLibrary from "./cms/MediaLibrary.jsx";
import PagesIndex from "./cms/PagesIndex.jsx";
import Layout from "./Layout.jsx";
import Newsletter from "./pages/Newsletter.jsx";
import NotFound from "./pages/NotFound.jsx";
import SubmissionDetail from "./pages/SubmissionDetail.jsx";
import SubmissionList from "./pages/SubmissionList.jsx";

const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { index: true, element: <Navigate to="/content/event" replace /> },
        { path: "content/:type", element: <ContentList /> },
        { path: "content/:type/new", element: <ContentEditor /> },
        { path: "content/:type/:id", element: <ContentEditor /> },
        { path: "pages", element: <PagesIndex /> },
        { path: "pages/:type", element: <ContentEditor page /> },
        { path: "media", element: <MediaLibrary /> },
        { path: "submissions/:type", element: <SubmissionList /> },
        { path: "submissions/:type/:reference", element: <SubmissionDetail /> },
        { path: "newsletter", element: <Newsletter /> },
        { path: "*", element: <NotFound /> },
      ],
    },
  ],
  { basename: "/admin" },
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
