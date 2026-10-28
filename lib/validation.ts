// Contact form rules. Used in the browser now for instant feedback,
// and again on the server in Phase 3 (never trust the browser alone).

export type ContactInput = {
  name: string;
  email: string;
  message: string;
};

export type ContactErrors = Partial<Record<keyof ContactInput, string>>;

export const CONTACT_LIMITS = { name: 100, email: 254, message: 3000 };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {};
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();

  if (!name) errors.name = "Please enter your name.";
  else if (name.length > CONTACT_LIMITS.name) errors.name = "Name is too long.";

  if (!email) errors.email = "Please enter your email.";
  else if (email.length > CONTACT_LIMITS.email || !EMAIL_PATTERN.test(email))
    errors.email = "Please enter a valid email address.";

  if (message.length < 10) errors.message = "Please write at least 10 characters.";
  else if (message.length > CONTACT_LIMITS.message)
    errors.message = `Please keep it under ${CONTACT_LIMITS.message} characters.`;

  return errors;
}
