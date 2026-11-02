import { index, layout, route } from "@react-router/dev/routes";

export default [
  layout("components/Layout.jsx", { id: "site" }, [
    index("pages/Home.jsx"),
    route("about", "pages/About.jsx"),
    route("membership", "pages/Membership.jsx"),
    route("services", "pages/Services.jsx"),
    route("events", "pages/Events.jsx"),
    route("events/:slug", "pages/EventDetail.jsx"),
    route("knowledge", "pages/Knowledge.jsx"),
    route("knowledge/ftcci-review", "pages/FtcciReview.jsx"),
    route("knowledge/useful-links", "pages/UsefulLinks.jsx"),
    route("knowledge/publications", "pages/PublicationsPage.jsx"),
    route("media", "pages/Media.jsx"),
    route("media/news/:slug", "pages/Article.jsx"),
    route("contact", "pages/Contact.jsx"),
    route("privilege-card", "pages/PrivilegeCard.jsx"),
    route("careers", "pages/Careers.jsx"),
    route("newsletter/confirm", "pages/NewsletterConfirm.jsx"),
    route("*", "pages/NotFound.jsx"),
  ]),
];
