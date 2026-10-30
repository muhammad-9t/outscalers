export type ContactField = "firstName" | "lastName" | "email" | "company" | "interest" | "message";
export type ContactErrors = Partial<Record<ContactField, string>>;
export type ContactValues = Record<ContactField, string>;

export const contactFields: ContactField[] = ["firstName", "lastName", "email", "company", "interest", "message"];

export const interests = [
  "AI solutions & agents",
  "Custom software development",
  "Business process automation",
  "Data engineering & cloud",
  "Security & quality engineering",
  "Team augmentation",
  "Not sure yet",
];

/** Caps keep a single enquiry to a sensible size on both client and server. */
const maxLength: Record<ContactField, number> = {
  firstName: 80,
  lastName: 80,
  email: 200,
  company: 120,
  interest: 80,
  message: 5000,
};

export function readContact(get: (k: ContactField) => unknown): ContactValues {
  const values = {} as ContactValues;
  for (const f of contactFields) values[f] = String(get(f) ?? "").trim();
  return values;
}

export function validateContact(v: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  if (!v.firstName) errors.firstName = "Please enter your first name.";
  if (!v.lastName) errors.lastName = "Please enter your last name.";
  if (!v.email) errors.email = "Please enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) errors.email = "Please enter a valid email address.";
  if (v.message.length < 20) errors.message = "Please tell us a little more (at least 20 characters).";
  if (v.interest && !interests.includes(v.interest)) errors.interest = "Please pick an area from the list.";
  for (const f of contactFields) {
    if (!errors[f] && v[f].length > maxLength[f]) errors[f] = `Please keep this under ${maxLength[f]} characters.`;
  }
  return errors;
}
