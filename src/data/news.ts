import bitcoinImg from "@/assets/news-bitcoin.jpg";
import ethereumImg from "@/assets/news-ethereum.jpg";
import regulationImg from "@/assets/news-regulation.jpg";
import indiaImg from "@/assets/news-india.jpg";
import defiImg from "@/assets/news-defi.jpg";

export type Story = {
  id: string;
  category: string;
  headline: string;
  summary?: string;
  author: string;
  time: string;
  badge?: "Exclusive" | "Analysis" | "Opinion" | "Explainer" | "Interview" | "Research";
  image?: string;
  source?: string;
};

export const breaking =
  "US spot Bitcoin ETFs post second straight day of outflows as BTC slips below $69,000";

export const leadStory: Story = {
  id: "lead",
  category: "Bitcoin",
  headline: "Bitcoin slides below $69,000 as ETF outflows meet a leveraged unwind",
  summary:
    "A second consecutive session of US spot ETF outflows collided with crowded long positioning, wiping out the week's gains in under four hours.",
  author: "Rhea Nair",
  time: "12 min ago",
  badge: "Analysis",
  image: bitcoinImg,
};

export const secondaryStories: Story[] = [
  {
    id: "sec-1",
    category: "Ethereum",
    headline: "Staked ETH hits a record share of supply as validators queue grows again",
    summary: "Exit queues stay short, but liquid restaking is quietly reshaping validator economics.",
    author: "Dev Malhotra",
    time: "38 min ago",
    image: ethereumImg,
  },
  {
    id: "sec-2",
    category: "Regulation",
    headline: "Lawmakers circulate a redraft of the market-structure bill ahead of hearings",
    summary: "The revision narrows the definition of a digital commodity and shifts custody rules.",
    author: "Ananya Bose",
    time: "1 hr ago",
    image: regulationImg,
  },
];

export const latestFeed: Story[] = [
  {
    id: "l1",
    category: "Markets",
    headline: "Solana leads majors with a 6.8% move as DEX volume share climbs to 34%",
    author: "AadiCrypto Desk",
    time: "4 min ago",
  },
  {
    id: "l2",
    category: "Stablecoins",
    headline: "Stablecoin supply expands for the ninth straight week to $168B",
    author: "Kabir Shah",
    time: "22 min ago",
  },
  {
    id: "l3",
    category: "Security",
    headline: "Cross-chain bridge pauses withdrawals after anomalous outflows detected",
    author: "Security Desk",
    time: "41 min ago",
  },
  {
    id: "l4",
    category: "India",
    headline: "Domestic exchanges report higher INR volumes ahead of tax-filing deadline",
    author: "Meera Iyer",
    time: "1 hr ago",
  },
  {
    id: "l5",
    category: "ETFs",
    headline: "Issuer files for a staking-enabled Ethereum ETF structure",
    author: "Rhea Nair",
    time: "2 hrs ago",
  },
  {
    id: "l6",
    category: "DeFi",
    headline: "Perp DEX fees overtake spot venues on two major chains",
    author: "Dev Malhotra",
    time: "2 hrs ago",
  },
  {
    id: "l7",
    category: "Mining",
    headline: "Hashprice steadies as difficulty adjustment comes in lower than expected",
    author: "AadiCrypto Desk",
    time: "3 hrs ago",
  },
  {
    id: "l8",
    category: "Macro",
    headline: "Inflation surprise pushes rate-cut odds into the next quarter",
    author: "Ananya Bose",
    time: "3 hrs ago",
  },
];

export type NewsroomSection = {
  id: string;
  title: string;
  href: string;
  featured: Story;
  stories: Story[];
};

export const newsroom: NewsroomSection[] = [
  {
    id: "bitcoin",
    title: "Bitcoin",
    href: "/bitcoin",
    featured: {
      id: "b-f",
      category: "Bitcoin",
      headline: "Halving math starts to bite: miners lean on treasury sales and hosting deals",
      summary: "Post-subsidy economics are separating low-cost operators from the rest of the field.",
      author: "Kabir Shah",
      time: "1 hr ago",
      image: bitcoinImg,
      badge: "Analysis",
    },
    stories: [
      {
        id: "b1",
        category: "Bitcoin",
        headline: "Long-term holder supply climbs to a new high despite the pullback",
        author: "Desk",
        time: "2 hrs ago",
      },
      {
        id: "b2",
        category: "Bitcoin",
        headline: "Lightning capacity recovers after a quiet quarter",
        author: "Desk",
        time: "4 hrs ago",
      },
      {
        id: "b3",
        category: "Bitcoin",
        headline: "Options open interest clusters at the $70,000 strike",
        author: "Desk",
        time: "5 hrs ago",
      },
    ],
  },
  {
    id: "ethereum",
    title: "Ethereum",
    href: "/ethereum",
    featured: {
      id: "e-f",
      category: "Ethereum",
      headline: "Gas stays cheap as rollups absorb the bulk of transaction demand",
      summary: "Blob fees remain the swing factor for L2 economics heading into the next upgrade.",
      author: "Dev Malhotra",
      time: "2 hrs ago",
      image: ethereumImg,
      badge: "Explainer",
    },
    stories: [
      {
        id: "e1",
        category: "Ethereum",
        headline: "Client teams set a testnet date for the next upgrade",
        author: "Desk",
        time: "3 hrs ago",
      },
      {
        id: "e2",
        category: "Ethereum",
        headline: "Restaking TVL concentration draws fresh risk warnings",
        author: "Desk",
        time: "5 hrs ago",
      },
      {
        id: "e3",
        category: "Ethereum",
        headline: "ETH supply turns mildly inflationary on low base fees",
        author: "Desk",
        time: "6 hrs ago",
      },
    ],
  },
  {
    id: "defi",
    title: "DeFi",
    href: "/defi",
    featured: {
      id: "d-f",
      category: "DeFi",
      headline: "Lending markets reprice risk as stablecoin yields compress",
      summary: "Utilisation is up, but incentive-driven deposits are proving fickle.",
      author: "Meera Iyer",
      time: "3 hrs ago",
      image: defiImg,
      badge: "Research",
    },
    stories: [
      {
        id: "d1",
        category: "DeFi",
        headline: "Protocol revenue hits a three-month high across top ten apps",
        author: "Desk",
        time: "4 hrs ago",
      },
      {
        id: "d2",
        category: "DeFi",
        headline: "Governance vote would redirect fees to token holders",
        author: "Desk",
        time: "6 hrs ago",
      },
      {
        id: "d3",
        category: "DeFi",
        headline: "RWA vaults cross $5B in tokenised treasury exposure",
        author: "Desk",
        time: "8 hrs ago",
      },
    ],
  },
];

export const indiaStories: Story[] = [
  {
    id: "in-f",
    category: "India · Policy",
    headline: "Policy consultation reopens the question of a domestic crypto framework",
    summary:
      "Officials are weighing disclosure and custody standards for exchanges operating in India.",
    author: "Meera Iyer",
    time: "1 hr ago",
    image: indiaImg,
  },
  {
    id: "in1",
    category: "Taxes & Compliance",
    headline: "What the current TDS treatment means for high-frequency traders",
    author: "Desk",
    time: "5 hrs ago",
    badge: "Explainer",
  },
  {
    id: "in2",
    category: "Exchanges",
    headline: "INR order books deepen as domestic venues add market makers",
    author: "Desk",
    time: "7 hrs ago",
  },
  {
    id: "in3",
    category: "CBDC",
    headline: "Retail digital rupee pilot extends to more merchant categories",
    author: "Desk",
    time: "9 hrs ago",
  },
];

export const research: Story[] = [
  {
    id: "r1",
    category: "Market Outlook",
    headline: "Q3 outlook: liquidity, ETF flows and the case for a range-bound quarter",
    summary: "Our base case, bull case and the three data points that would change our mind.",
    author: "AadiCrypto Research",
    time: "Yesterday",
    badge: "Research",
  },
  {
    id: "r2",
    category: "On-chain",
    headline: "Cost-basis clusters show where this cycle's supply actually sits",
    summary: "A cohort view of realised price across short and long-term holders.",
    author: "AadiCrypto Research",
    time: "2 days ago",
    badge: "Research",
  },
  {
    id: "r3",
    category: "Institutional",
    headline: "Treasury allocators are standardising crypto mandates",
    summary: "What twelve institutional mandates reveal about custody and reporting demands.",
    author: "AadiCrypto Research",
    time: "3 days ago",
    badge: "Research",
  },
];

export const learnTracks = [
  { title: "Crypto 101", level: "Beginner", lessons: 12 },
  { title: "Bitcoin", level: "Beginner", lessons: 9 },
  { title: "Ethereum", level: "Intermediate", lessons: 11 },
  { title: "Trading Basics", level: "Beginner", lessons: 14 },
  { title: "DeFi", level: "Intermediate", lessons: 10 },
  { title: "Wallet Security", level: "Essential", lessons: 7 },
  { title: "Taxes & Regulation", level: "India", lessons: 8 },
];
