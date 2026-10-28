// Testimonial form limits, shared by the form (browser) and the server action.
// The database function submit_testimonial enforces the same numbers.
export const TESTIMONIAL_LIMITS = { name: 100, role: 120, quoteMin: 20, quoteMax: 1500 };
