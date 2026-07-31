export const PROJECT_OPTIONS = [
  {
    label: "AI Strategy & Consulting",
    aliases: ["ai strategy", "ai consulting", "ai roadmap"],
    openingQuestion:
      "Great place to start. Which team or business function needs the AI strategy, and what outcome should the roadmap improve?",
  },
  {
    label: "Generative AI",
    aliases: ["generative ai", "gen ai", "genai", "llm", "copilot"],
    openingQuestion:
      "Great. Who will use the generative AI solution, and what content or knowledge task should it help them complete?",
  },
  {
    label: "Agentic AI",
    aliases: ["agentic ai", "ai agent", "ai agents", "autonomous agent"],
    openingQuestion:
      "Great. Who will use or supervise the agent, and which workflow should it carry out on their behalf?",
  },
  {
    label: "Predictive AI",
    aliases: ["predictive ai", "predictive analytics", "forecasting", "prediction model"],
    openingQuestion:
      "Great. Who will use the predictions, and what decision or outcome should the model help them improve?",
  },
  {
    label: "Analytical AI",
    aliases: ["analytical ai", "ai analytics", "data analysis", "decision intelligence"],
    openingQuestion:
      "Great. Who needs the analysis, and which business questions or KPIs should the solution make clearer?",
  },
  {
    label: "Mobile App",
    aliases: ["mobile app", "ios app", "android app"],
    openingQuestion:
      "A mobile app sounds exciting. Who is the primary user, and what should they be able to accomplish from their phone?",
  },
  {
    label: "Web App",
    aliases: ["web app", "web application", "web portal"],
    openingQuestion:
      "A web app sounds exciting. Who is the primary user, and what core task should the application make easier?",
  },
  {
    label: "Cloud Solutions",
    aliases: ["cloud", "cloud solution", "cloud solutions", "cloud infrastructure", "cloud migration"],
    openingQuestion:
      "Great. Which team or workload needs the cloud solution, and what reliability, scale, or security problem should it solve?",
  },
  {
    label: "Process Automation",
    aliases: ["process automation", "workflow automation", "business automation"],
    openingQuestion:
      "Great. Which team owns the process, and what repetitive workflow is taking the most time today?",
  },
  {
    label: "Systems Integration",
    aliases: ["systems integration", "system integration", "api integration", "software integration"],
    openingQuestion:
      "Great. Who depends on the integration, and which systems need to exchange information?",
  },
  {
    label: "E-commerce",
    aliases: ["e-commerce", "ecommerce", "online store", "online shop"],
    openingQuestion:
      "An e-commerce experience sounds exciting. What will you sell, and who is the target customer?",
  },
];

const normalise = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s&+-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function findProjectOption(message) {
  const input = normalise(message);
  return PROJECT_OPTIONS.find((option) =>
    [option.label, ...option.aliases]
      .map(normalise)
      .some((term) => input === term || input.includes(term)),
  );
}
