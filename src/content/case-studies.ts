import type { ServiceSlug } from "./services";

export type CaseStudy = {
  slug: string;
  title: string;
  industry: string;
  /** Client name is only shown once disclosure is approved. */
  client: string | null;
  /** Public website of the product, shown as a link in the project details. */
  url?: string;
  /** Short text for the link, e.g. "Google Play"; when set the row reads "Get the app". */
  urlLabel?: string;
  summary: string;
  overview: string;
  challenge: string[];
  solution: string[];
  /** Only populated when Human + AI practices were actually used on the project. */
  humanAiApproach: string[] | null;
  stack: string[];
  implementation: string[];
  /** Only verified, client-approved results. Empty until confirmed. */
  results: string[];
  services: ServiceSlug[];
  visual: "scale" | "traffic" | "compliance";
  /** Real product image for cards and the hero; replaces the diagram when set. */
  cover?: CaseImage;
  /** Product screens shown on the case-study page. */
  gallery?: (CaseImage & { title: string; caption: string })[];
  /**
   * `draft` profiles are based on project summaries from the previous website
   * and still need client approval, verified results and screenshots.
   */
  status: "draft" | "published";
};

export type CaseImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /**
   * Cursor tour on the hero laptop: 5 [left%, top%] stops on the screen —
   * rest, hover, then three clicks. Defaults suit the Nizamio landing page.
   */
  cursor?: [number, number][];
};

/**
 * Every profile, including drafts. Drafts are kept here but hidden from the site
 * (no page, card or sitemap entry) until they are real and approved.
 */
const allCaseStudies: CaseStudy[] = [
  {
    slug: "nizamio-cloud-erp",
    title: "Nizamio: a cloud ERP that runs the whole business from one place",
    industry: "Business software",
    client: "Nizamio",
    summary:
      "One platform for HRM, CRM, POS, inventory and accounting, with an admin dashboard, a mobile app for iOS and Android, and a product landing page.",
    overview:
      "Nizamio is a cloud-based ERP for growing businesses. It brings HRM, CRM, POS, inventory and accounting into one product, so owners and managers can follow sales, stock, finances, customers and staff without switching between tools.",
    challenge: [
      "Businesses were running sales, stock, finance and staff in separate tools that did not share data.",
      "Owners needed a real-time view across several branches and warehouses.",
      "Managers needed the same numbers on their phones, not only at a desk.",
    ],
    solution: [
      "An admin dashboard that brings sales, inventory, finances and people into one workspace.",
      "Multi-branch control, with stock tracked per branch and warehouse.",
      "A mobile app with stock, revenue, receivables and payables on the go.",
      "A landing page that explains the five modules and leads visitors to a demo.",
    ],
    humanAiApproach: null,
    stack: ["Web dashboard", "iOS & Android", "Cloud"],
    implementation: [
      "The product is built as modules (HRM, CRM, POS, Inventory, Accounting) on one shared data model.",
      "Dashboards are filtered by date range and branch, with figures updated in real time.",
      "The web dashboard and the mobile app share the same figures, so every screen tells the same story.",
    ],
    results: [],
    services: ["software-development", "data-cloud"],
    visual: "scale",
    cover: {
      src: "/portfolio/nizamio/cover-landing.webp",
      alt: "Nizamio landing page: Cloud-Based ERP System from one platform, with HRM, CRM, POS, Inventory and Accounting module cards",
      width: 1575,
      height: 866,
    },
    gallery: [
      {
        src: "/portfolio/nizamio/dashboard.webp",
        alt: "Nizamio key features: sales analytics, inventory monitoring, CRM, financial management, people and operations, multi-branch control and transaction history, next to the admin dashboard on a tablet",
        width: 1937,
        height: 1285,
        title: "Admin dashboard",
        caption: "Sales, finances, inventory and customers in one workspace, with real-time figures for every branch.",
      },
      {
        src: "/portfolio/nizamio/mobile-app.webp",
        alt: "Nizamio mobile app on Android and iPhone, showing stock levels, net revenue, profit and customer balances",
        width: 1927,
        height: 1226,
        title: "Mobile app",
        caption: "Stock, revenue, receivables and payables on Android and iOS.",
      },
      {
        src: "/portfolio/nizamio/landing-page.webp",
        alt: "Nizamio landing page on a desktop monitor: Cloud-Based ERP System from one platform, with HRM, CRM, POS, Inventory and Accounting cards",
        width: 1927,
        height: 1226,
        title: "Landing page",
        caption: "A clean landing page that explains the five modules and leads visitors to a demo.",
      },
    ],
    status: "published",
  },
  {
    slug: "go-raahi-tours",
    title: "GO Raahi Tours: rent a car or join a tour from trusted local companies",
    industry: "Travel & tourism",
    client: "GO Raahi Tours",
    summary:
      "A booking platform where travellers find car rentals and guided tours from trusted local companies, all in one place.",
    overview:
      "GO Raahi Tours brings local car-rental and tour companies onto one platform. Travellers explore trips and vehicles, compare companies, book, and message the company directly, while each company manages its own listings and bookings.",
    challenge: [
      "Travellers had to search many small companies separately to find a car or a tour.",
      "It was hard to tell which local companies could be trusted.",
      "Bookings and questions were spread across phone calls and chat apps.",
    ],
    solution: [
      "An Explore page for trips and vehicles, and a Companies directory with company profiles.",
      "Bookings in one place, with a My bookings view for every traveller.",
      "Built-in messages and notifications between travellers and companies.",
      "Saved trips, so travellers can come back and book later.",
    ],
    humanAiApproach: null,
    stack: ["Web app", "Booking system", "Cloud"],
    implementation: [
      "Separate experiences for travellers and for the companies listing cars and tours.",
      "A clean, friendly interface with a guided home page carousel.",
    ],
    results: [],
    services: ["software-development"],
    visual: "traffic",
    cover: {
      src: "/portfolio/go-raahi/cover.webp",
      alt: "GO Raahi Tours home page: Your journey starts here, with a van driving a mountain road towards a map pin",
      width: 1569,
      height: 863,
      cursor: [
        [66, 62],
        [29, 4],
        [51, 4],
        [70, 4],
        [14, 71],
      ],
    },
    gallery: [
      {
        src: "/portfolio/go-raahi/web-app.webp",
        alt: "GO Raahi Tours home page on a laptop in a dark studio: Your journey starts here, with a van driving a mountain road and an Explore Goraahi button",
        width: 1928,
        height: 1230,
        title: "Web app",
        caption: "A friendly home page that helps travellers rent a car or join a tour from trusted local companies.",
      },
      {
        src: "/portfolio/go-raahi/explore.webp",
        alt: "GO Raahi Tours Explore page: vehicle cards with prices per day, filters for category, transmission, fuel, price and rating, and a popup inviting rental and tour companies to list their business",
        width: 1927,
        height: 1226,
        title: "Explore & filters",
        caption: "Travellers filter vehicles and tours by type, fuel, price and rating, and companies can list their fleet in a few clicks.",
      },
      {
        src: "/portfolio/go-raahi/screens.webp",
        alt: "GO Raahi Tours on desktop and tablet: the listings page, the companies directory with a map, and a vehicle page with daily, weekly, monthly and with-driver rates",
        width: 1927,
        height: 1226,
        title: "Companies & vehicle details",
        caption: "A companies directory with a map, and vehicle pages with clear daily, weekly, monthly and with-driver rates.",
      },
    ],
    status: "published",
  },
  {
    slug: "yallasplit",
    title: "YallaSplit: split group expenses and settle up in seconds",
    industry: "Personal finance",
    client: "YallaSplit",
    url: "https://yallasplit.com/",
    summary:
      "A mobile app for iOS and Android where friends, roommates and travellers share expenses, see who owes what and settle up, with budgets and income tracking built in.",
    overview:
      "YallaSplit helps groups keep shared money fair. People create a group for a trip, a household or a night out, add expenses as they happen and settle up with as few payments as possible. Beyond splitting, it tracks personal income and budgets, in any currency.",
    challenge: [
      "Groups were tracking shared costs in chats and spreadsheets, and lost track of who paid and who owed what.",
      "Settling up took many small payments between people.",
      "Trips and households often mix currencies.",
    ],
    solution: [
      "Groups for trips, households and events, with equal, percentage or custom splits.",
      "Smart settlements that suggest who should pay whom, with fewer transactions.",
      "Multi-currency expenses with automatic conversion.",
      "Income and budget tracking by category, with recurring income and spending analytics.",
      "A landing page that explains the app and links to the App Store and Google Play.",
    ],
    humanAiApproach: null,
    stack: ["iOS & Android", "Landing page", "Cloud"],
    implementation: [
      "One app for shared expenses and personal finance, with Groups, Friends, Activity and More in the bottom navigation.",
      "AI suggestions for expense categories, participants and split types.",
      "Light and dark themes in the app and on the website.",
    ],
    results: [],
    services: ["software-development", "ai-solutions"],
    visual: "scale",
    cover: {
      src: "/portfolio/yallasplit/cover.webp",
      alt: "YallaSplit landing page: Your Trusted Way to Split Expenses, with App Store and Google Play buttons beside two phones showing the app",
      width: 1575,
      height: 866,
      cursor: [
        [30, 62],
        [64, 40],
        [43, 5],
        [82, 5],
        [16, 73],
      ],
    },
    gallery: [
      {
        src: "/portfolio/yallasplit/income-expense.webp",
        alt: "Two phones on a teal background with the YallaSplit name: the Income screen with net balance, income and expenses in PKR, and the Add Expense screen with amount, title and paid by",
        width: 1927,
        height: 1226,
        title: "Income & expenses",
        caption: "Track income, add expenses in any currency and choose who paid.",
      },
      {
        src: "/portfolio/yallasplit/groups.webp",
        alt: "YallaSplit Groups screen in dark mode on a phone, with All, Just Me and With Others filters, next to the line Bringing Clarity to Every Expense",
        width: 1927,
        height: 1226,
        title: "Groups",
        caption: "Shared and personal groups in one list, in a clean dark theme.",
      },
    ],
    status: "published",
  },
  {
    slug: "zakatly",
    title: "Zakatly: track Zakat and Sadaqah, and see the impact of your giving",
    industry: "Islamic charity & personal finance",
    client: "Zakatly",
    url: "https://play.google.com/store/apps/details?id=com.outscalers.zakatly",
    urlLabel: "Google Play",
    summary:
      "A modern Islamic charity app for Android to calculate Zakat, record Zakat and Sadaqah contributions, and see where your giving goes.",
    overview:
      "Zakatly helps Muslims manage their charity with ease and in line with Islamic guidelines. People calculate the Zakat they owe, record every Zakat and Sadaqah contribution with its beneficiary and project, and follow their giving across the year in clear reports.",
    challenge: [
      "People tracked their Zakat and Sadaqah on paper, in notes or not at all.",
      "Working out how much Zakat was due each cycle was confusing.",
      "It was hard to see the total given in a year and where it went.",
    ],
    solution: [
      "A Zakat calculator that follows Islamic guidelines.",
      "Contributions for Zakat and Sadaqah, with beneficiary, project, Zakat cycle, payment method and status (planned or paid).",
      "Reports with the total charity this year, the Zakat still due and a charity distribution chart.",
    ],
    humanAiApproach: null,
    stack: ["Android app", "Reports & analytics", "Cloud"],
    implementation: [
      "A calm dark interface in green and gold, with a clear contribution list and a guided Add Contribution form.",
      "Beneficiaries and projects saved once and reused for every new contribution.",
    ],
    results: [],
    services: ["software-development"],
    visual: "scale",
    cover: {
      src: "/portfolio/zakatly/cover.webp",
      alt: "Zakatly: Track. Donate. Make an Impact. A phone on a pedestal shows the Reports screen with total charity this year of PKR 125,000 and Zakat due of PKR 12,500",
      width: 1927,
      height: 1226,
      cursor: [
        [62, 50],
        [22, 23],
        [57, 36],
        [46, 22],
        [21, 67],
      ],
    },
    gallery: [
      {
        src: "/portfolio/zakatly/contributions.webp",
        alt: "Zakatly: Zakat, A Blessing for All, beside two phones showing the Contributions list with Sadaqah Jariyah and Zakat entries and the Add Contribution form",
        width: 1927,
        height: 1226,
        title: "Contributions",
        caption: "Record Zakat and Sadaqah with the beneficiary, project, cycle and payment method, and mark each one planned or paid.",
      },
      {
        src: "/portfolio/zakatly/cover.webp",
        alt: "Zakatly Reports screen on a phone: total charity this year, Zakat due, portfolio, active, returns and pending cards, and the charity distribution chart",
        width: 1927,
        height: 1226,
        title: "Reports",
        caption: "The year's total giving, the Zakat still due and how charity is split, at a glance.",
      },
    ],
    status: "published",
  },
  {
    slug: "hisoq",
    title: "Hisoq: run a restaurant's covers, tickets and margin from one live dashboard",
    industry: "Restaurants & hospitality",
    client: "Hisoq",
    url: "https://hisoq.com/",
    summary:
      "A multi-tenant restaurant management SaaS that connects POS, kitchen display, menu, inventory, tables and reports for every branch in one live system.",
    overview:
      "Hisoq is restaurant management software for single venues and multi-branch groups. Guests order, Hisoq keeps the floor, the kitchen and the stock on one live ticket, and managers close each shift with sales, labour and stock in one view.",
    challenge: [
      "Restaurants paid for many tools (POS, delivery, loyalty, accounting) that did not share data.",
      "Kitchen, floor, stock and reservations each lived in a different place.",
      "Tickets were shouted or re-keyed between service and the line, which caused remakes.",
      "Managers only saw which shift lost money after it had closed.",
    ],
    solution: [
      "Smart POS and billing for dine-in, takeaway and delivery, with split bills, discounts and service charges.",
      "A kitchen display (KDS) with real-time tickets, priorities and status for the floor.",
      "Menu management with items, categories, addons and coupons, tied to inventory.",
      "Tables and reservations that match real capacity.",
      "Multi-branch operations with roles and permissions per location.",
      "Reports and analytics on revenue, bestsellers and trends.",
    ],
    humanAiApproach: null,
    stack: ["Multi-tenant SaaS", "Web app", "Responsive dashboard", "Cloud"],
    implementation: [
      "One admin for dashboard, POS, orders, kitchen, reservations, register and delivery, with menu, operations, finance, inventory, loyalty and staff sections.",
      "Multi-currency and multi-language, with light and dark themes.",
      "A responsive dashboard that works on desktop and phone.",
    ],
    results: [],
    services: ["software-development", "data-cloud"],
    visual: "scale",
    cover: {
      src: "/portfolio/hisoq/cover.webp",
      alt: "Hisoq landing page: Run covers, tickets, and margin from one live dashboard, above a preview of the restaurant dashboard",
      width: 1575,
      height: 866,
      cursor: [
        [62, 82],
        [50, 32],
        [44, 52],
        [44, 4],
        [49, 4],
      ],
    },
    gallery: [
      {
        src: "/portfolio/hisoq/dashboard.webp",
        alt: "Hisoq dashboard on a floating laptop: total orders, total sales, average value, reservations, total revenue, top selling items, recent orders and order type",
        width: 1927,
        height: 1226,
        title: "Live dashboard",
        caption: "Orders, sales, average value and reservations for today, with revenue, bestsellers and order types.",
      },
      {
        src: "/portfolio/hisoq/menu.webp",
        alt: "Hisoq menu categories on a desktop monitor: category cards with status, item counts and actions, and the full admin navigation",
        width: 1927,
        height: 1226,
        title: "Menu management",
        caption: "Items, categories, addons and coupons that show on the POS and the customer app.",
      },
      {
        src: "/portfolio/hisoq/desktop-mobile.webp",
        alt: "Hisoq dashboard on a desktop monitor and on a phone held in a hand",
        width: 1927,
        height: 1226,
        title: "Desktop & mobile",
        caption: "The same live dashboard on the office screen and on a manager's phone.",
      },
    ],
    status: "published",
  },
  {
    slug: "outscalers-hub",
    title: "Outscalers Hub: clients, employees and finances in one secure CRM",
    industry: "Business software",
    client: "Outscalers (in-house product)",
    url: "https://crm.outscalers.com/",
    summary:
      "An all-in-one business platform for HR, finance, clients and operations, with a knowledge vault, a mobile app and an AI assistant for employees.",
    overview:
      "Outscalers Hub is the CRM we built and run ourselves. It brings HR, payroll, clients, invoices, operations, hiring and documents into one secure platform with role-based access. Employees use the mobile app for attendance, the company feed and an AI assistant that answers questions about leave and company policies.",
    challenge: [
      "HR, finance, client records and documents were spread across separate tools and spreadsheets.",
      "Different roles needed different access to the same data.",
      "Employees asked HR the same questions about leave and policies again and again.",
    ],
    solution: [
      "Modules for HR, finance, clients, operations, jobs and hiring, attendance, documents, loans, offices and user management.",
      "A Knowledge Vault with client and internal vaults, structured records, smart sharing and private, shared or client visibility.",
      "Role-based access control, with permissions and an audit trail.",
      "A mobile app with attendance check-in and analytics, a company feed and an AI assistant that answers questions about leave and company policies.",
    ],
    humanAiApproach: null,
    stack: ["Web app", "iOS & Android", "AI assistant", "Cloud"],
    implementation: [
      "One shared data model behind every module, with real-time sync between the web app and the mobile app.",
      "The AI assistant answers from each employee's own leave balance and the company policies.",
      "Light and dark themes.",
    ],
    results: [],
    services: ["software-development", "ai-solutions"],
    visual: "scale",
    cover: {
      src: "/portfolio/outscalers-hub/cover.webp",
      alt: "Outscalers Hub landing page: One platform. Everything in control. Beside a dashboard card with clients, tasks and revenue",
      width: 1575,
      height: 866,
      cursor: [
        [68, 42],
        [25, 32],
        [20, 61],
        [44, 4],
        [49, 4],
      ],
    },
    gallery: [
      {
        src: "/portfolio/outscalers-hub/landing-page.webp",
        alt: "Outscalers Hub landing page on a desktop monitor: One platform. Everything in control, with 24/7 availability, multi-role access control, data security and real-time sync",
        width: 1927,
        height: 1226,
        title: "Web platform",
        caption: "Clients, employees and finances in one secure CRM, with multi-role access and real-time sync.",
      },
      {
        src: "/portfolio/outscalers-hub/mobile-app.webp",
        alt: "Outscalers Hub mobile app: the company feed, the AI assistant answering leave and policy questions, the app icon on a home screen, and attendance analytics",
        width: 1927,
        height: 1226,
        title: "Mobile app & AI assistant",
        caption: "Company feed, attendance and an AI assistant that tells employees their leave balance and finds the right policy.",
      },
    ],
    status: "published",
  },
  {
    slug: "fintech-platform-scaling",
    title: "Scaling a fintech platform for rapid user growth",
    industry: "Financial services",
    client: null,
    summary:
      "Re-architecting a growing fintech product into services that could scale with demand while meeting data-protection requirements.",
    overview:
      "A fintech startup needed its platform to keep pace with fast user growth. The engagement focused on moving from a monolithic application to a service-based architecture with stronger data-protection controls.",
    challenge: [
      "A single application was becoming a bottleneck as usage grew.",
      "Personal and financial data required careful handling under GDPR.",
      "The team needed to keep shipping features while the platform evolved.",
    ],
    solution: [
      "Incremental migration to a microservices architecture.",
      "Data-protection controls designed into services and storage.",
      "Automated testing and continuous integration to keep releases safe.",
    ],
    humanAiApproach: null,
    stack: ["Node.js", "PostgreSQL", "AWS", "Microservices"],
    implementation: [
      "Services were extracted one domain at a time to limit risk.",
      "Monitoring was introduced alongside each new service.",
    ],
    results: [],
    services: ["software-development", "data-cloud", "security-quality"],
    visual: "scale",
    status: "draft",
  },
  {
    slug: "ecommerce-peak-traffic",
    title: "Preparing an e-commerce platform for peak traffic",
    industry: "Retail & e-commerce",
    client: null,
    summary:
      "Cloud-native infrastructure and CDN caching to keep an online store responsive during seasonal traffic spikes.",
    overview:
      "An e-commerce business needed its platform to stay available and responsive through high-traffic sales events such as Black Friday, without permanently over-provisioning infrastructure.",
    challenge: [
      "Traffic during sales events was many times higher than normal.",
      "Infrastructure costs were high outside of peak periods.",
      "Slow pages during peaks risked lost orders.",
    ],
    solution: [
      "Cloud-native infrastructure that scales with demand.",
      "CDN and caching strategy for catalogue and static content.",
      "Load testing ahead of known peak events.",
    ],
    humanAiApproach: null,
    stack: ["AWS", "CDN", "Containers", "PostgreSQL"],
    implementation: [
      "Capacity was planned around expected peak events.",
      "Caching rules were tuned per content type.",
    ],
    results: [],
    services: ["data-cloud", "software-development"],
    visual: "traffic",
    status: "draft",
  },
  {
    slug: "healthcare-saas-compliance",
    title: "Compliance-ready patient data management for a healthcare SaaS",
    industry: "Healthcare",
    client: null,
    summary:
      "Strengthening security and compliance practices so a healthcare SaaS product could grow while handling patient data responsibly.",
    overview:
      "A healthcare SaaS provider needed to scale its patient data management capabilities while meeting HIPAA requirements and the expectations of its healthcare customers.",
    challenge: [
      "Patient data required strict access control and auditability.",
      "Customers expected evidence of secure development practices.",
      "The product needed to support a growing number of users.",
    ],
    solution: [
      "Access controls and audit logging designed around HIPAA requirements.",
      "Secure development practices embedded in the delivery pipeline.",
      "Scalable data storage and processing for patient records.",
    ],
    humanAiApproach: null,
    stack: ["Python", "PostgreSQL", "AWS"],
    implementation: [
      "Security requirements were captured as testable acceptance criteria.",
      "Audit trails were added to sensitive operations.",
    ],
    results: [],
    services: ["security-quality", "data-cloud", "software-development"],
    visual: "compliance",
    status: "draft",
  },
];

/** Only published profiles appear on the site. */
export const caseStudies: CaseStudy[] = allCaseStudies.filter((c) => c.status === "published");

export function getCaseStudy(slug: string) {
  return caseStudies.find((c) => c.slug === slug);
}
