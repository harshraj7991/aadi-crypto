export type Subcategory = { title: string; slug: string; defaultSort?: "latest" | "most-read" | "editors-pick" };
export type Category = {
  title: string;
  slug: string;
  blurb: string;
  subcategories: Subcategory[];
};

export const categories: Category[] = [
  {
    title: "Markets",
    slug: "markets",
    blurb: "Price action, trading, funds and the macro forces moving digital assets.",
    subcategories: [
      { title: "Price Action & Market Wraps", slug: "price-action-market-wraps" },
      { title: "Trading & Derivatives", slug: "trading-derivatives" },
      { title: "ETFs, Funds & Treasuries", slug: "etfs-funds-treasuries" },
      { title: "Macro & Cross-Asset", slug: "macro-cross-asset" },
    ],
  },
  {
    title: "Coins & Ecosystems",
    slug: "coins-ecosystems",
    blurb: "Bitcoin, Ethereum, Solana and the ecosystems competing for attention.",
    subcategories: [
      { title: "Bitcoin", slug: "bitcoin" },
      { title: "Ethereum & Layer 2", slug: "ethereum-layer-2" },
      { title: "Solana & High-Performance L1s", slug: "solana-high-performance-l1s" },
      { title: "Altcoins, Memecoins & Emerging Tokens", slug: "altcoins-memecoins-emerging-tokens" },
    ],
  },
  {
    title: "DeFi & Stablecoins",
    slug: "defi-stablecoins",
    blurb: "Decentralized markets, lending, stablecoins and tokenized real-world assets.",
    subcategories: [
      { title: "DEXs & Liquidity", slug: "dexs-liquidity" },
      { title: "Lending, Yield & Staking", slug: "lending-yield-staking" },
      { title: "Stablecoins & Payments", slug: "stablecoins-payments" },
      { title: "RWA & Tokenization", slug: "rwa-tokenization" },
    ],
  },
  {
    title: "Business & Institutions",
    slug: "business-institutions",
    blurb: "Companies, capital, institutions and the infrastructure businesses behind crypto.",
    subcategories: [
      { title: "Exchanges & Brokers", slug: "exchanges-brokers" },
      { title: "Funding, VC & M&A", slug: "funding-vc-ma" },
      { title: "Banks, Asset Managers & Corporate Adoption", slug: "banks-asset-managers-corporate-adoption" },
      { title: "Mining, Validators & Infrastructure Companies", slug: "mining-validators-infrastructure-companies" },
    ],
  },
  {
    title: "Regulation & Policy",
    slug: "regulation-policy",
    blurb: "Rules, enforcement, taxation and public policy across the world's major regions.",
    subcategories: [
      { title: "United States", slug: "united-states" },
      { title: "Europe & United Kingdom", slug: "europe-united-kingdom" },
      { title: "Asia-Pacific & India", slug: "asia-pacific-india" },
      { title: "Global Policy, Tax & CBDCs", slug: "global-policy-tax-cbdcs" },
    ],
  },
  {
    title: "Technology & Web3 Infrastructure",
    slug: "technology-web3-infrastructure",
    blurb: "Protocol engineering, wallets, interoperability and emerging decentralized technology.",
    subcategories: [
      { title: "Protocol Upgrades & Scaling", slug: "protocol-upgrades-scaling" },
      { title: "Wallets, Custody & Account Abstraction", slug: "wallets-custody-account-abstraction" },
      { title: "Zero-Knowledge, Interoperability & Data", slug: "zero-knowledge-interoperability-data" },
      { title: "AI x Crypto, DePIN & Emerging Tech", slug: "ai-crypto-depin-emerging-tech" },
    ],
  },
  {
    title: "Security & Risk",
    slug: "security-risk",
    blurb: "Incidents, fraud, protocol vulnerabilities and custody risk.",
    subcategories: [
      { title: "Hacks, Exploits & Incident Response", slug: "hacks-exploits-incident-response" },
      { title: "Scams, Fraud & Enforcement", slug: "scams-fraud-enforcement" },
      { title: "Smart Contract & Protocol Security", slug: "smart-contract-protocol-security" },
      { title: "Exchange, Custody & Wallet Security", slug: "exchange-custody-wallet-security" },
    ],
  },
  {
    title: "On-Chain & Data",
    slug: "on-chain-data",
    blurb: "Network activity, capital flows, liquidity and the data behind crypto narratives.",
    subcategories: [
      { title: "Network Activity & Fees", slug: "network-activity-fees" },
      { title: "Whales, Exchange Flows & Holder Behavior", slug: "whales-exchange-flows-holder-behavior" },
      { title: "DeFi TVL, Stablecoin Flows & Liquidity", slug: "defi-tvl-stablecoin-flows-liquidity" },
      { title: "Sentiment, Narratives & Developer Activity", slug: "sentiment-narratives-developer-activity" },
    ],
  },
  {
    title: "Web3 Culture & Consumer",
    slug: "web3-culture-consumer",
    blurb: "Digital culture, games, communities and everyday consumer adoption.",
    subcategories: [
      { title: "NFTs & Digital Collectibles", slug: "nfts-digital-collectibles" },
      { title: "Gaming & Metaverse", slug: "gaming-metaverse" },
      { title: "Social, DAOs & Creator Economy", slug: "social-daos-creator-economy" },
      { title: "Adoption, Merchants & Consumer Apps", slug: "adoption-merchants-consumer-apps" },
    ],
  },
  {
    title: "Research & Learn",
    slug: "research-learn",
    blurb: "Practical education, investigations, commentary and data-led reporting.",
    subcategories: [
      { title: "Explainers & How-To", slug: "explainers-how-to", defaultSort: "most-read" },
      { title: "Deep Dives & Investigations", slug: "deep-dives-investigations", defaultSort: "editors-pick" },
      { title: "Opinion & Commentary", slug: "opinion-commentary", defaultSort: "editors-pick" },
      { title: "Reports, Interviews & Data Stories", slug: "reports-interviews-data-stories", defaultSort: "editors-pick" },
    ],
  },
];

export const contentFormats = [
  { title: "Analysis", slug: "analysis" },
  { title: "Opinion", slug: "opinion" },
  { title: "Explainers", slug: "explainers" },
  { title: "Research", slug: "research" },
] as const;

export type Topic = { title: string; slug: string; kind: "asset" | "entity" | "theme"; blurb: string };

export const topics: Topic[] = [
  {
    title: "Bitcoin",
    slug: "bitcoin",
    kind: "asset",
    blurb: "Editorial coverage of Bitcoin: ETFs, mining, holders and market structure.",
  },
  {
    title: "Ethereum",
    slug: "ethereum",
    kind: "asset",
    blurb: "Staking, rollups, upgrades and the economics of the Ethereum ecosystem.",
  },
  {
    title: "Solana",
    slug: "solana",
    kind: "asset",
    blurb: "Throughput, apps, DEX volume and the Solana ecosystem.",
  },
  {
    title: "ETFs",
    slug: "etfs",
    kind: "theme",
    blurb: "Spot and futures crypto funds, flows, filings and issuers.",
  },
  {
    title: "Stablecoins",
    slug: "stablecoins",
    kind: "theme",
    blurb: "Dollar tokens, reserves, supply growth and payment use.",
  },
  {
    title: "India",
    slug: "india",
    kind: "theme",
    blurb: "Indian policy, tax, exchanges, the digital rupee and domestic demand.",
  },
];

export const coinHubs = [
  { symbol: "BTC", name: "Bitcoin", slug: "bitcoin" },
  { symbol: "ETH", name: "Ethereum", slug: "ethereum" },
  { symbol: "SOL", name: "Solana", slug: "solana" },
  { symbol: "XRP", name: "XRP", slug: "xrp" },
  { symbol: "BNB", name: "BNB", slug: "bnb" },
  { symbol: "DOGE", name: "Dogecoin", slug: "dogecoin" },
];

/** Visible desktop menu; the taxonomy underneath stays comprehensive. */
export const mainNav = [
  { label: "Latest", to: "/news" as const },
  { label: "Markets", to: "/news/$category" as const, params: { category: "markets" } },
  { label: "Bitcoin", to: "/topics/$slug" as const, params: { slug: "bitcoin" } },
  { label: "Ethereum", to: "/topics/$slug" as const, params: { slug: "ethereum" } },
  {
    label: "Regulation",
    to: "/news/$category" as const,
    params: { category: "regulation-policy" },
  },
  { label: "DeFi", to: "/news/$category" as const, params: { category: "defi-stablecoins" } },
  { label: "Business", to: "/news/$category" as const, params: { category: "business-institutions" } },
  { label: "Tech", to: "/news/$category" as const, params: { category: "technology-web3-infrastructure" } },
];

export function findCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function findSubcategory(category: Category, slug: string) {
  return category.subcategories.find((s) => s.slug === slug);
}

export function findTopic(slug: string) {
  return topics.find((t) => t.slug === slug);
}

export function findCoin(slug: string) {
  return coinHubs.find((c) => c.slug === slug);
}
