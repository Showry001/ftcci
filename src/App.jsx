import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Membership from "./pages/Membership.jsx";
import Services from "./pages/Services.jsx";
import Events from "./pages/Events.jsx";
import EventDetail from "./pages/EventDetail.jsx";
import Knowledge from "./pages/Knowledge.jsx";
import FtcciReview from "./pages/FtcciReview.jsx";
import UsefulLinks from "./pages/UsefulLinks.jsx";
import PublicationsPage from "./pages/PublicationsPage.jsx";
import Media from "./pages/Media.jsx";
import Contact from "./pages/Contact.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="membership" element={<Membership />} />
          <Route path="services" element={<Services />} />
          <Route path="events" element={<Events />} />
          <Route path="events/:slug" element={<EventDetail />} />
          <Route path="knowledge" element={<Knowledge />} />
          <Route path="knowledge/ftcci-review" element={<FtcciReview />} />
          <Route path="knowledge/useful-links" element={<UsefulLinks />} />
          <Route path="knowledge/publications" element={<PublicationsPage />} />
          <Route path="media" element={<Media />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
