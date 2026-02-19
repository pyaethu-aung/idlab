function FeedbackBanner({ message }) {
  if (!message) return null;

  return (
    <p className="mx-auto max-w-md text-sm font-medium theme-text-accent">
      {message}
    </p>
  );
}

// Note: FeedbackBanner is intentionally removed/replaced by inline success states if needed, 
// or can be re-integrated. For now, we focus on the new static layout per spec.
// If feedback prop is critical, we can render it below buttons.

function Hero({ feedback }) {
  return (
    <section aria-label="Hero" className="relative hero-bg pt-12 pb-8 md:pt-16 md:pb-12">
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <div className="space-y-6">
          {/* Badge */}
          <div className="flex justify-center">
            <span className="theme-badge inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase shadow-sm">
              Fresh IDs
            </span>
          </div>

          {/* Headlines */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter theme-text-primary leading-[1.05] text-balance">
              Instant UUID generator built for flow
            </h1>
            <p className="mx-auto max-w-2xl text-lg md:text-xl theme-text-secondary leading-relaxed">
              Generate high-entropy RFC 4122 identifiers, format them for your stack, and copy or download entire batches without touching a terminal.
            </p>
          </div>

          {/* Feedback message if any */}
          {feedback && (
            <p className="animate-fade-in text-sm font-medium theme-text-accent">
              {feedback}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default Hero;
