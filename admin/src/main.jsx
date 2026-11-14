import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./styles.css";
import Auth, { RequireStaff, SuperAdminOnly } from "./auth.jsx";
import ContentEditor from "./cms/ContentEditor.jsx";
import ContentList from "./cms/ContentList.jsx";
import MediaLibrary from "./cms/MediaLibrary.jsx";
import PageEditor from "./cms/PageEditor.jsx";
import PagesIndex from "./cms/PagesIndex.jsx";
import Layout from "./Layout.jsx";
import Account from "./pages/Account.jsx";
import Activity from "./pages/Activity.jsx";
import Bin from "./pages/Bin.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Newsletter from "./pages/Newsletter.jsx";
import NotFound from "./pages/NotFound.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import SignIn from "./pages/SignIn.jsx";
import Staff from "./pages/Staff.jsx";
import SubmissionDetail from "./pages/SubmissionDetail.jsx";
import SubmissionList from "./pages/SubmissionList.jsx";

const superAdmin = (element) => <SuperAdminOnly>{element}</SuperAdminOnly>;

const router = createBrowserRouter(
  [
    {
      element: <Auth />,
      children: [
        { path: "sign-in", element: <SignIn /> },
        { path: "forgot-password", element: <ForgotPassword /> },
        { path: "reset-password", element: <ResetPassword /> },
        // The page editor fills the screen, without the admin's sidebar.
        { path: "pages/:view", element: <RequireStaff><PageEditor /></RequireStaff> },
        {
          element: <Layout />,
          children: [
            { index: true, element: <Dashboard /> },
            { path: "content/:type", element: <ContentList /> },
            { path: "content/:type/new", element: <ContentEditor /> },
            { path: "content/:type/:id", element: <ContentEditor /> },
            { path: "pages", element: <PagesIndex /> },
            { path: "media", element: <MediaLibrary /> },
            { path: "submissions/:type", element: <SubmissionList /> },
            { path: "submissions/:type/:reference", element: <SubmissionDetail /> },
            { path: "newsletter", element: <Newsletter /> },
            { path: "account", element: <Account /> },
            { path: "staff", element: superAdmin(<Staff />) },
            { path: "activity", element: superAdmin(<Activity />) },
            { path: "bin", element: superAdmin(<Bin />) },
            { path: "*", element: <NotFound /> },
          ],
        },
      ],
    },
  ],
  { basename: "/admin" },
);

// In development the admin's address is 127.0.0.1:5174 (ADMIN_URL in api/.env). "localhost" reaches the
// same server, but to the browser it is another address, so sign-in and the page editor's preview would
// be refused. Switch to the right address before anything loads.
if (import.meta.env.DEV && window.location.hostname === "localhost") {
  window.location.replace(window.location.href.replace("//localhost", "//127.0.0.1"));
} else {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  );
}
