import Hero from "../components/Hero.jsx";
import QuickActions from "../components/QuickActions.jsx";
import NewsletterForm from "../components/NewsletterForm.jsx";
import WhoWeAre from "../components/WhoWeAre.jsx";
import MobileAbout from "../components/MobileAbout.jsx";
import Leadership from "../components/Leadership.jsx";
import Events from "../components/Events.jsx";
import Venues from "../components/Venues.jsx";
import News from "../components/News.jsx";
import MobileUpdates from "../components/MobileUpdates.jsx";
import Publications from "../components/Publications.jsx";
import Benefits from "../components/Benefits.jsx";
import PrivilegeCard from "../components/PrivilegeCard.jsx";
import styles from "./Home.module.css";

export default function Home() {
  return (
    <>
        <div className={styles.topBand}>
          <div className={styles.topStack}>
            <Hero />
            <div className="desktop-only">
              <NewsletterForm />
            </div>
            <div className={`desktop-only ${styles.whoWeAre}`}>
              <WhoWeAre />
            </div>
          </div>
        </div>
        <QuickActions />
        <MobileAbout />
        <Leadership />
        <Events />
        <Venues />
        <News />
        <MobileUpdates />
        <Publications />
        <Benefits />
        <PrivilegeCard />
    </>
  );
}
