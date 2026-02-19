import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Hero from './Hero';

describe('Hero Component', () => {
    it('renders key hero elements', () => {
        render(<Hero />);

        // Badge
        expect(screen.getByText(/Fresh IDs/i)).toBeInTheDocument();

        // Headline
        expect(screen.getByText(/Instant UUID generator built for flow/i)).toBeInTheDocument();

        // Sub-headline (check for partial text)
        expect(screen.getByText(/Generate high-entropy RFC 4122 identifiers/i)).toBeInTheDocument();




    });

    it('renders hero background container', () => {
        render(<Hero />);
        // Check for the full-width section with relative positioning
        const section = screen.getByLabelText('Hero');
        expect(section).toHaveClass('relative', 'hero-bg');
    });

    it('uses theme-aware classes', () => {
        render(<Hero />);

        // Check for theme classes on key elements
        const badge = screen.getByText(/FRESH IDS/i);
        expect(badge).toHaveClass('theme-badge');

        const h1 = screen.getByRole('heading', { level: 1 });
        expect(h1).toHaveClass('theme-text-primary');


        const learnMoreLink = screen.queryByRole('link', { name: /Learn More/i });
        expect(learnMoreLink).not.toBeInTheDocument();
    });
});
