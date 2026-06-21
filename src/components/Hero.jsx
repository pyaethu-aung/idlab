// The display header above a family's workbench. Defaults carry the UUID copy
// so the generator's <Hero /> is unchanged; ULID and NanoID pass their own.
// The title is split lead + accent + trail so the accent word (each family's
// defining property) lands mid-line, matching the original UUID treatment.
const UUID_HERO = {
  lead: "Mint ",
  accent: "RFC 4122",
  trail: " identifiers",
  line2: "at the speed of a keypress.",
  sub: "High-entropy UUIDs across v4 random, v1 timestamped, and v7 sortable. Formatted, batched, copied or downloaded without leaving the keyboard.",
};

function Hero({
  lead = UUID_HERO.lead,
  accent = UUID_HERO.accent,
  trail = UUID_HERO.trail,
  line2 = UUID_HERO.line2,
  sub = UUID_HERO.sub,
}) {
  return (
    <section className="hero" aria-label="Hero">
      <h1 className="hero-title">
        {lead}
        <span className="accent-mark">{accent}</span>
        {trail}
        <br />
        <span className="hero-title-2">{line2}</span>
      </h1>
      <p className="hero-sub">{sub}</p>
    </section>
  );
}

export default Hero;
