/** The company's story, shown in the animated "Our evolution" section on the About page. */
export type EvolutionStep = {
  when: string;
  label: string;
  title: string;
  body: string;
};

export const evolution: EvolutionStep[] = [
  {
    when: "2017",
    label: "The beginning",
    title: "From freelancing to global connections",
    body: "Freelance web and mobile projects for clients abroad, built on quality work and reliable delivery.",
  },
  {
    when: "2020",
    label: "Adapting through COVID-19",
    title: "Turning challenges into opportunities",
    body: "The pandemic made remote work the norm, and we learned to deliver fully remote.",
  },
  {
    when: "2021–22",
    label: "Growing beyond freelancing",
    title: "From individual projects to team delivery",
    body: "Bigger projects called for teams, so we moved from solo work to team delivery.",
  },
  {
    when: "2023",
    label: "Outscalers takes shape",
    title: "Software development & outsourcing",
    body: "Outscalers was founded in Rawalpindi: a software development and outsourcing partner.",
  },
  {
    when: "Today",
    label: "AI-powered engineering",
    title: "Human expertise. AI acceleration.",
    body: "100+ in-house engineers, working as dedicated teams and accelerated by AI.",
  },
];
