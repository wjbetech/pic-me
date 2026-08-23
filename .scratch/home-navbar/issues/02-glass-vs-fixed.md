# Glass-on-scroll vs top-fixed + content push

Status: resolved
Type: grilling
Blocked by: 01

## Answer

Sticky glass. Navbar is `sticky top-0`; transparent at 0, then `bg-base-100/80 backdrop-blur-md shadow-sm border-b border-base-content/10` past the hero threshold. No pushed CTA row is added to page content — the single-intent `Start Playing` CTA stays the only funnel, preserving the five-section rhythm.

## Question

If the navbar scrolls away (top-fixed, not sticky), do we need to add actions inside the page content to push the user back toward the main CTAs — or should it become sticky with a glass effect so it stays available?

Inbox gives both paths: "It could turn to a glass effect with scrolling so, or we can leave it at the top of the page and add actions to the content of the page to push user back towards the main CTAs."

This decides the position strategy and whether a second CTA row is needed below the hero/marquee.
