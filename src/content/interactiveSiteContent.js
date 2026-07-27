export const interactiveSiteContent = {
  capabilities: [
    {
      id: "ai-strategy",
      title: "AI Strategy & Consulting",
      shortDescription: "Turn AI uncertainty into a clear, practical roadmap.",
      fullDescription:
        "DEKODE identifies useful AI opportunities, prioritises use cases, reviews data and workflows, and builds a roadmap grounded in responsible adoption.",
      value: "Best for teams exploring AI or needing a clearer direction.",
      keywords: ["AI roadmap", "responsible AI", "opportunity mapping"],
      chatPrompt: "Tell me how DEKODE can help shape an AI strategy for my business.",
      sourceReference: "DEKODE/src/pages/Services.jsx#ai-strategy",
    },
    {
      id: "custom-ai",
      title: "Custom AI Development",
      shortDescription: "Purpose-built AI that fits real business workflows.",
      fullDescription:
        "From machine learning and generative AI to internal copilots, search and knowledge systems, DEKODE develops AI around a specific operational need.",
      value: "Useful when an off-the-shelf tool does not fit the problem.",
      keywords: ["generative AI", "machine learning", "internal copilots"],
      chatPrompt: "I want to discuss a custom AI solution with DEKODE.",
      sourceReference: "DEKODE/src/pages/Services.jsx#custom-ai",
    },
    {
      id: "web-mobile",
      title: "Web & Mobile Development",
      shortDescription: "Apps, portals and interfaces people actually adopt.",
      fullDescription:
        "DEKODE designs and develops web apps, iOS and Android apps, dashboards and internal tools with user experience at the centre.",
      value: "From rapid prototype through to production-ready delivery.",
      keywords: ["web apps", "mobile apps", "UX/UI"],
      chatPrompt: "Help me explore a web or mobile product with DEKODE.",
      sourceReference: "DEKODE/src/pages/Services.jsx#web-mobile",
    },
    {
      id: "ecommerce",
      title: "E-Commerce + AI",
      shortDescription: "Smarter shopping experiences that convert and scale.",
      fullDescription:
        "DEKODE builds e-commerce platforms with personalisation, intelligent search, workflow automation and scalable architecture.",
      value: "For retailers and brands launching or upgrading online.",
      keywords: ["e-commerce", "personalisation", "intelligent search"],
      chatPrompt: "Tell me how DEKODE could improve an e-commerce platform.",
      sourceReference: "DEKODE/src/pages/Services.jsx#ecommerce",
    },
    {
      id: "automation",
      title: "Integrations + Automation",
      shortDescription: "Connect systems and remove repetitive manual work.",
      fullDescription:
        "DEKODE connects platforms, develops APIs and automates business processes across operations, finance and support.",
      value: "For disconnected tools, manual workflows or fragile integrations.",
      keywords: ["APIs", "integrations", "business automation"],
      chatPrompt: "I want to discuss integrations and workflow automation.",
      sourceReference: "DEKODE/src/pages/Services.jsx#integrations",
    },
    {
      id: "cloud-security",
      title: "Cloud, IT + Security",
      shortDescription: "Secure, scalable foundations built for reliability.",
      fullDescription:
        "DEKODE supports cloud strategy and migration, infrastructure, identity and access, data protection, security hardening and ongoing management.",
      value: "For stable, secure systems without a full in-house IT team.",
      keywords: ["AWS", "Azure", "GCP", "security"],
      chatPrompt: "I want to discuss secure cloud and IT foundations.",
      sourceReference: "DEKODE/src/pages/Services.jsx#cloud-it",
    },
  ],
  selectedWork: [
    {
      id: "food-manufacturing",
      title: "Food Manufacturing Company",
      industry: "Food Manufacturing",
      challenge:
        "A paper-based production system made information difficult to find, limited operational visibility and increased manual reporting effort.",
      approach:
        "DEKODE worked with the client to understand operating gaps, designed a cloud-based information capture system, prototyped it, then iterated with regular feedback.",
      solution:
        "An electronic information capture and production management system on Microsoft Azure.",
      outcome:
        "The client reduced manual effort and associated costs by 20% in Phase 1, while gaining faster operational feedback.",
      relatedCapability: "Integrations + Automation",
      chatPrompt:
        "I want to discuss a project similar to DEKODE's food manufacturing production system.",
      sourceReference: "DEKODE/src/pages/FoodManufacture.jsx",
    },
    {
      id: "primary-school",
      title: "Primary School",
      industry: "Education",
      challenge:
        "Paper-based administration made records difficult to store, locate, archive and report, adding time and administrative overhead.",
      approach:
        "DEKODE helped move visitor, child movement, staff and incident records into an automated information system.",
      solution: "AttendMe, a cloud-based management system on AWS.",
      outcome:
        "The school reduced administrative overhead, improved record access and reporting, and supported a safer environment for children.",
      relatedCapability: "Web & Mobile Development",
      chatPrompt:
        "I want to discuss a project similar to DEKODE's school administration system.",
      sourceReference: "DEKODE/src/pages/PrimarySchool.jsx",
    },
    {
      id: "chauffr",
      title: "CHAUFFR",
      industry: "Transport",
      challenge: "Chauffeurs needed to receive and manage bookings while on the go.",
      approach:
        "DEKODE designed a connected mobile and web experience for booking management.",
      solution: "Android and iOS apps with an integrated web portal.",
      outcome: "A unified experience for chauffeurs to receive and manage bookings.",
      relatedCapability: "Web & Mobile Development",
      chatPrompt: "I want to discuss a connected mobile and web product like CHAUFFR.",
      sourceReference: "DEKODE/src/components/PortfolioShowcase.jsx",
    },
  ],
  deliveryProcess: [
    {
      id: "discover",
      title: "Discover",
      description: "Align on goals, users, constraints, workflows and actionable quick wins.",
      question: "What problem or opportunity are you trying to understand?",
      chatPrompt: "Help me discover and clarify the problem my project should solve.",
    },
    {
      id: "design",
      title: "Design",
      description: "Define solution architecture, UI/UX flows, delivery plan and success measures.",
      question: "What should a successful experience look like for your users?",
      chatPrompt: "Help me define the solution and user experience for my project.",
    },
    {
      id: "build",
      title: "Build",
      description: "Implement, integrate, test and document the logic for production.",
      question: "What needs to work in the first useful release?",
      chatPrompt: "Help me identify what belongs in the first useful release.",
    },
    {
      id: "secure",
      title: "Secure",
      description: "Embed privacy, access control, IT governance and hardening from day one.",
      question: "What data, access or compliance needs should we account for?",
      chatPrompt: "Help me think through security and data requirements for my project.",
    },
    {
      id: "run-optimise",
      title: "Run & Optimise",
      description: "Support what ships, monitor performance, iterate and optimise.",
      question: "How will the solution be supported and improved after launch?",
      chatPrompt: "Tell me how DEKODE can support and improve a solution after launch.",
    },
  ],
  industries: [
    {
      id: "education",
      title: "Education",
      challenge: "Administrative load, fragmented records and workflows that are difficult to manage.",
      capabilities: ["Web & Mobile", "Automation", "Cloud"],
      solution: "Accessible digital tools and connected information workflows.",
      chatPrompt: "I want to discuss a digital solution for education.",
    },
    {
      id: "healthcare",
      title: "Healthcare",
      challenge: "Sensitive information and workflows that need clarity, reliability and security.",
      capabilities: ["Secure Cloud", "Automation", "Digital Products"],
      solution: "Security-first systems designed around real operational needs.",
      chatPrompt: "I want to discuss a secure digital solution for healthcare.",
    },
    {
      id: "finance",
      title: "Finance + Accounting",
      challenge: "Manual processes, disconnected data and complex customer journeys.",
      capabilities: ["AI", "Integrations", "Web & Mobile"],
      solution: "Connected tools that streamline decisions and customer workflows.",
      chatPrompt: "I want to discuss a finance or accounting technology solution.",
    },
    {
      id: "legal",
      title: "Legal",
      challenge: "Knowledge-heavy work, document workflows and responsible information handling.",
      capabilities: ["AI Strategy", "Knowledge Systems", "Security"],
      solution: "Practical AI and secure workflow tools with governance built in.",
      chatPrompt: "I want to discuss a responsible technology solution for legal work.",
    },
    {
      id: "food-agriculture",
      title: "Food + Agriculture",
      challenge: "Paper-based operations and limited visibility across production processes.",
      capabilities: ["Automation", "Cloud", "Data Platforms"],
      solution: "Digital information capture and operational management systems.",
      chatPrompt: "I want to discuss an operations solution for food or agriculture.",
    },
    {
      id: "retail",
      title: "Retail",
      challenge: "Disconnected commerce, inventory and customer experiences.",
      capabilities: ["E-Commerce", "AI", "Integrations"],
      solution: "Scalable commerce experiences with intelligent search and automation.",
      chatPrompt: "I want to discuss a retail or e-commerce solution.",
    },
  ],
  conversionPrompts: {
    start: "I have an idea and want to tell DEKODE what I am building.",
    meeting: "I would like to request a meeting about my project.",
  },
};

