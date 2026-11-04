/** The "How well do you know your software?" self-check on the Services page. */
export type Answer = "y" | "n" | "d";

export const answerLabels: Record<Answer, string> = { y: "Yes", n: "No", d: "Don't know" };

export const quickCheckQuestions = [
  "Do you know which PHP or Node version runs on your systems?",
  "Is there an up-to-date list of all systems, domains and credentials?",
  "Is the source code stored somewhere your company can access itself, for example on GitHub or GitLab?",
  "Has a backup been restored as a test in the last three months?",
  "Could someone new take over your most important system using the documentation?",
  "Do you hear about vulnerabilities in your components before you read about them in the news?",
  "Are API keys and passwords kept only on the server and never in the browser code?",
  "Is there a named person who installs updates regularly?",
];

/** Result bands, from the lowest score up. `min` is the number of "yes" answers needed. */
export const quickCheckLevels = [
  {
    min: 0,
    title: "Big blind spots",
    body: "Right now nobody can say for sure what is running or how to recover it. The assessment gives you that picture first.",
  },
  {
    min: 3,
    title: "Some gaps",
    body: "When the next big vulnerability comes, you would lose time. The assessment closes the most important gaps first.",
  },
  {
    min: 6,
    title: "Mostly covered",
    body: "The basics are in place. An assessment confirms it and finds the few weak spots that are left.",
  },
  {
    min: 8,
    title: "In good shape",
    body: "You know your software well. Maintenance keeps it that way, with updates and checks on a fixed schedule.",
  },
];

/** Query parameter that carries the answers to the contact form, one letter per question (y/n/d). */
export const quickCheckParam = "check";

/** Turns encoded answers into a short summary for the enquiry message, or null if they are invalid. */
export function quickCheckSummary(encoded: string | null): string | null {
  if (!encoded || !new RegExp(`^[ynd]{${quickCheckQuestions.length}}$`).test(encoded)) return null;
  const answers = encoded.split("") as Answer[];
  const yes = answers.filter((a) => a === "y").length;
  const lines = quickCheckQuestions.map((q, i) => `${i + 1}. ${q} ${answerLabels[answers[i]]}`);
  return `Quick check result: ${yes}/${quickCheckQuestions.length} answered with yes.\n\n${lines.join("\n")}\n\n`;
}
