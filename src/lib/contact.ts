export type ContactField =
  | "firstName"
  | "lastName"
  | "email"
  | "company"
  | "need"
  | "devCount"
  | "location"
  | "interest"
  | "message";
export type ContactErrors = Partial<Record<ContactField, string>>;
export type ContactValues = Record<ContactField, string>;

export const contactFields: ContactField[] = [
  "firstName",
  "lastName",
  "email",
  "company",
  "need",
  "devCount",
  "location",
  "interest",
  "message",
];

/** "What do you need?": the two kinds of enquiry. `?need=dedicated` or `?need=project` preselects one. */
export const NEED_DEDICATED = "Dedicated developers";
export const NEED_PROJECT = "A full project";
export const needs = [NEED_DEDICATED, NEED_PROJECT];
export const needParam: Record<string, string> = { dedicated: NEED_DEDICATED, project: NEED_PROJECT };

/** Only asked for dedicated developers */
export const devCounts = ["1", "2–4", "5–10", "10+"];
export const locations = ["Pakistan", "Europe", "Mixed", "Not sure"];

/** Only asked for a full project */
export const interests = [
  "AI solutions & agents",
  "Custom software development",
  "Business process automation",
  "Data engineering & cloud",
  "Security & quality engineering",
  "Not sure yet",
];

/** Caps keep a single enquiry to a sensible size on both client and server. */
const maxLength: Record<ContactField, number> = {
  firstName: 80,
  lastName: 80,
  email: 200,
  company: 120,
  need: 40,
  devCount: 10,
  location: 20,
  interest: 80,
  message: 5000,
};

export function readContact(get: (k: ContactField) => unknown): ContactValues {
  const values = {} as ContactValues;
  for (const f of contactFields) values[f] = String(get(f) ?? "").trim();
  // Each kind of enquiry keeps only its own follow-up answers
  if (values.need !== NEED_DEDICATED) values.devCount = values.location = "";
  if (values.need === NEED_DEDICATED) values.interest = "";
  return values;
}

export function validateContact(v: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  if (!v.firstName) errors.firstName = "Please enter your first name.";
  if (!v.lastName) errors.lastName = "Please enter your last name.";
  if (!v.email) errors.email = "Please enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) errors.email = "Please enter a valid email address.";
  if (v.message.length < 20) errors.message = "Please tell us a little more (at least 20 characters).";
  if (v.need && !needs.includes(v.need)) errors.need = "Please pick one of the options.";
  if (v.devCount && !devCounts.includes(v.devCount)) errors.devCount = "Please pick a team size from the list.";
  if (v.location && !locations.includes(v.location)) errors.location = "Please pick a location from the list.";
  if (v.interest && !interests.includes(v.interest)) errors.interest = "Please pick an area from the list.";
  for (const f of contactFields) {
    if (!errors[f] && v[f].length > maxLength[f]) errors[f] = `Please keep this under ${maxLength[f]} characters.`;
  }
  return errors;
}
