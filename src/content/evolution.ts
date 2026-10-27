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
    body: "Our journey began with freelance software development, building web and mobile solutions for clients and establishing international relationships through quality work and reliable delivery.",
  },
  {
    when: "2020",
    label: "Adapting through COVID-19",
    title: "Turning challenges into opportunities",
    body: "The pandemic accelerated the shift toward remote work and digital transformation. We adapted to the changing landscape, strengthened remote collaboration, and embraced new ways to deliver software solutions to businesses.",
  },
  {
    when: "2021–22",
    label: "Growing beyond freelancing",
    title: "From individual projects to team delivery",
    body: "As projects became more complex, we moved toward team-based, project-driven development, bringing together developers and specialists to deliver larger solutions and support clients over the long term.",
  },
  {
    when: "2023",
    label: "Outscalers takes shape",
    title: "Software development & outsourcing",
    body: "We formalized our vision into Outscalers, a software development and outsourcing partner connecting international businesses with engineering talent, building collaborative teams, and delivering scalable technology solutions.",
  },
  {
    when: "Today",
    label: "AI-powered engineering",
    title: "Human expertise. AI acceleration.",
    body: "We combine experienced engineers with modern AI tools to develop web and mobile applications, SaaS platforms, and intelligent software solutions. By embracing AI-assisted development and LLM integrations, we help businesses move faster, innovate smarter, and build reliable products without compromising quality or security.",
  },
];
