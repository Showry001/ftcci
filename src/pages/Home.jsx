import { useLoaderData } from "react-router";
import Hero from "../components/Hero.jsx";
import QuickActions from "../components/QuickActions.jsx";
import NewsletterForm from "../components/NewsletterForm.jsx";
import KpiStrip from "../components/KpiStrip.jsx";
import WhoWeAre from "../components/WhoWeAre.jsx";
import MobileAbout from "../components/MobileAbout.jsx";
import Leadership from "../components/Leadership.jsx";
import Events from "../components/Events.jsx";
import Venues from "../components/Venues.jsx";
import News from "../components/News.jsx";
import MobileUpdates from "../components/MobileUpdates.jsx";
import Benefits from "../components/Benefits.jsx";
import PrivilegeCard from "../components/PrivilegeCard.jsx";
import { list, single } from "../lib/content.server.js";
import styles from "./Home.module.css";

export async function loader({ request }) {
  const [home, hero, about, upcoming, recent, articles, publications, reviews] = await Promise.all([
    single("home", request),
    single("hero", request),
    single("about", request),
    list("event", { when: "upcoming", limit: 5 }),
    list("event", { when: "past", limit: 5 }),
    list("article", { limit: 4 }),
    list("publication", { limit: 4 }),
    list("review", { limit: 4 }),
  ]);
  return {
    home,
    hero,
    bearers: about.officeBearers,
    upcoming: upcoming.items,
    recent: recent.items,
    articles: articles.items,
    publications: publications.items,
    reviews: reviews.items,
  };
}

export default function Home() {
  const { home, hero, bearers, upcoming, recent, articles, publications, reviews } = useLoaderData();
  return (
    <>
        <div className={styles.topBand}>
          <div className={styles.topStack}>
            <Hero hero={hero} />
            <div className="desktop-only">
              <NewsletterForm perks={home.formPerks} />
            </div>
          </div>
        </div>
        <div className="desktop-only">
          <KpiStrip kpis={home.kpis} />
        </div>
        <div className={`desktop-only ${styles.whoBand}`}>
          <div className={styles.topStack}>
            <WhoWeAre image={home.whoWeAreImage} photo={home.whoWeArePhoto} />
          </div>
        </div>
        <QuickActions actions={home.quickActions} />
        <MobileAbout />
        <Leadership bearers={bearers} />
        <Events upcoming={upcoming} recent={recent} />
        <Venues highlights={home.venueHighlights} featured={home.venueFeatured} venues={home.venues} />
        <News articles={articles} />
        <MobileUpdates articles={articles} publications={publications} reviews={reviews} />
        <Benefits image={home.benefitsImage} photo={home.benefitsPhoto} benefits={home.benefits} />
        <PrivilegeCard image={home.privilegeCardImage} />
    </>
  );
}
