import { useEffect, useState } from "react";
import { Link } from "react-router";
import Arrow from "./Arrow.jsx";
import Img from "./Img.jsx";
import styles from "./Hero.module.css";

const SLIDE_MS = 6000;

// Home hero: a video (phones get a lighter 720p file) or an image carousel, chosen in the admin.
export default function Hero({ hero }) {
  return (
    <section className={styles.hero} aria-labelledby="hero-title" data-no-reveal>
      {hero.mode === "carousel" ? <Slides slides={hero.slides} /> : <HeroVideo video={hero.video} poster={hero.poster} />}
      {/* Figma fill: VIDEO + 40% black overlay */}
      <div className={styles.overlay} aria-hidden="true" />
      <div className={styles.content}>
        <h1 id="hero-title" className={styles.title}>
          {hero.title} {hero.titleAccent && <span>{hero.titleAccent}</span>}
        </h1>
        <div className={styles.ctas}>
          {hero.primary?.label && hero.primary.href && (
            <Link to={hero.primary.href} className={`${styles.btn} ${styles.btnGold}`}>
              {hero.primary.label} <Arrow tone="navy" />
            </Link>
          )}
          {hero.secondary?.label && hero.secondary.href && (
            <Link to={hero.secondary.href} className={`${styles.btn} ${styles.btnNavy}`}>
              {hero.secondary.label} <Arrow tone="white" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function HeroVideo({ video, poster }) {
  const posterUrl = poster?.url ?? video?.poster ?? undefined;
  if (!video?.url) return posterUrl ? <img className={styles.video} src={posterUrl} alt="" aria-hidden="true" /> : null;
  return (
    <video className={styles.video} autoPlay muted loop playsInline preload="auto" poster={posterUrl} aria-hidden="true">
      {video.mobileUrl && <source src={video.mobileUrl} type="video/mp4" media="(max-width: 767px)" />}
      <source src={video.url} type="video/mp4" />
    </video>
  );
}

function Slides({ slides }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setActive((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => clearInterval(t);
  }, [slides.length]);
  return slides.map((s, i) => (
    <Img
      key={s.image?.id ?? i}
      media={s.image}
      alt=""
      aria-hidden="true"
      sizes="(min-width: 1200px) 1240px, 100vw"
      loading={i === 0 ? "eager" : "lazy"}
      className={`${styles.video} ${styles.slide}`}
      data-active={i === active || undefined}
    />
  ));
}
