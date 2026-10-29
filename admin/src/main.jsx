import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./styles.css";
import Layout from "./Layout.jsx";
import Newsletter from "./pages/Newsletter.jsx";
import NotFound from "./pages/NotFound.jsx";
import SubmissionDetail from "./pages/SubmissionDetail.jsx";
import SubmissionList from "./pages/SubmissionList.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename="/admin">
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/submissions/hall-booking" replace />} />
          <Route path="submissions/:type" element={<SubmissionList />} />
          <Route path="submissions/:type/:reference" element={<SubmissionDetail />} />
          <Route path="newsletter" element={<Newsletter />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
