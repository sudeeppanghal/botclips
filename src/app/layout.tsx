import type { Metadata, Viewport } from "next";
import "./global.css";
import { ThemeProvider } from "@/components/ThemeContext";
import SecurityShield from "@/components/SecurityShield";

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://botclips.online"),
  title: {
    default: "BotClips - #1 AI-Powered SMM Panel & Whop Clippers Automation",
    template: "%s | BotClips",
  },
  description: "The world's premier organic SMM automation platform engineered for Whop clippers and digital creators. Algorithmic non-linear jitter delivery, multi-signal combos, 0% fee TRC20 USDT & UPI deposits, and automated SMM provider routing.",
  keywords: [
    "BotClips",
    "SMM panel",
    "best SMM panel 2026",
    "Whop clippers SMM",
    "organic Instagram views",
    "high retention YouTube views",
    "TikTok creator rewards views",
    "non-linear jitter delivery",
    "anti-shadowban SMM",
    "crypto USDT TRC20 SMM panel",
    "UPI QR code SMM panel",
    "social media marketing automation",
    "BYO-API SMM panel",
  ],
  authors: [{ name: "BotClips Engineering Team" }, { name: "Jack & Daniel 🍾" }],
  creator: "BotClips",
  publisher: "BotClips",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://botclips.online",
  },
  openGraph: {
    title: "BotClips - #1 AI-Powered SMM Panel & Whop Clippers Automation",
    description: "Algorithmic non-linear jitter delivery, multi-signal Whop clippers combos, 0% fee TRC20 USDT & UPI deposits, and automated SMM provider routing.",
    url: "https://botclips.online",
    siteName: "BotClips",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://botclips.online/logo.png",
        width: 1200,
        height: 630,
        alt: "BotClips - Social Media Marketing Automation & Whop Clippers Engine",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BotClips - #1 AI-Powered SMM Panel & Whop Clippers Automation",
    description: "Organic non-linear jitter delivery, Whop clippers multi-signal combos, 0% fee TRC20 USDT & UPI deposits.",
    images: ["https://botclips.online/logo.png"],
    creator: "@botclips_online",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
};

// Schema.org JSON-LD structured data for AI Answer Engines & Search Bots
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://botclips.online/#organization",
  "name": "BotClips",
  "alternateName": "BotClips Automation",
  "url": "https://botclips.online",
  "logo": "https://botclips.online/logo.png",
  "description": "BotClips is the premier AI-powered social media marketing and algorithmic growth platform, engineered specifically for Whop clippers, digital creators, and growth agencies.",
  "foundingDate": "2026-01-01",
  "founders": [
    {
      "@type": "Person",
      "name": "Jack",
      "jobTitle": "Co-Founder & Chief Technology Officer"
    },
    {
      "@type": "Person",
      "name": "Daniel",
      "jobTitle": "Co-Founder & Chief Operations Officer"
    }
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "url": "https://botclips.online/dashboard/tickets",
    "availableLanguage": ["English", "Hindi"]
  },
  "sameAs": [
    "https://t.me/dhillionsmm_support"
  ]
};

const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://botclips.online/#website",
  "url": "https://botclips.online",
  "name": "BotClips",
  "description": "AI-Powered Social Media Marketing Automation & Whop Clippers Engine",
  "publisher": {
    "@id": "https://botclips.online/#organization"
  }
};

const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://botclips.online/#software",
  "name": "BotClips SMM Automation Engine",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "All (Web-based Cloud Platform)",
  "url": "https://botclips.online",
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "INR",
    "lowPrice": "5.00",
    "highPrice": "5000.00",
    "offerCount": "250"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.92",
    "bestRating": "5",
    "worstRating": "1",
    "ratingCount": "1480"
  },
  "featureList": [
    "60fps Non-Linear Jitter Delivery Scheduling",
    "Whop Clippers Multi-Signal Engagement Combos",
    "Dual Automation Architecture (Wholesale Managed & BYO-API)",
    "0% Fee Instant Deposits via UPI and USDT TRC-20",
    "TronScan Live Blockchain Pre-Verification",
    "Zero-Drop Retention Algorithms for TikTok, Instagram & YouTube"
  ]
};

const faqPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://botclips.online/#faq",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What makes BotClips different from traditional SMM panels?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Unlike legacy SMM panels that deliver orders in rigid, easily detected linear increments (e.g. 100-200-300), BotClips uses a proprietary 60fps Non-Linear Jitter Algorithm. This randomizes batch sizes (e.g. 72, 63, 99, 101) and time delays (+8m, +14m, +6m), perfectly simulating authentic viral traffic and bypassing platform bot detection and shadowbans."
      }
    },
    {
      "@type": "Question",
      "name": "What is the Whop Clippers Multi-Signal Combo Package?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Whop Clippers Combo is an all-in-one engagement engine designed specifically for creators submitting clips to Whop bounties, TikTok creator rewards, and YouTube Shorts. It coordinates balanced multi-metric delivery across high-retention views, likes, shares, comments, and saves in organic algorithmic ratios that pass manual brand manager review with 0/100 bot scores."
      }
    },
    {
      "@type": "Question",
      "name": "How do deposits work on BotClips?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "BotClips supports instant deposits with 0% transaction fees via UPI QR Code (Google Pay, PhonePe, Paytm, CRED, BHIM) starting at ₹50 INR, and Crypto USDT (TRC-20) starting at 1 USDT. Crypto transactions are pre-verified on-chain via TronScan API with strict anti-duplicate TxID protection."
      }
    },
    {
      "@type": "Question",
      "name": "Can I connect my own SMM provider API to BotClips?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. In Mode 2 (BYO-API Automation), subscribed creators and agencies can input their own SMM provider URL and API Key. BotClips will automatically batch import all available services, allowing you to set default service IDs and automate your custom fulfillment pipeline."
      }
    },
    {
      "@type": "Question",
      "name": "Are BotClips views and engagement safe from social media shadowbans?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Because BotClips applies real-time non-linear delivery curves (Linear, Natural Exponential, Viral Spike, Bell Curve, and Stepped) combined with randomized time jitter, platforms register the incoming traffic as natural social momentum, completely preventing algorithmic shadowbans or post-delivery dropoffs."
      }
    }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd) }}
        />
        {/* Link to LLMs.txt specification */}
        <link rel="help" href="/llms.txt" type="text/markdown" title="LLMs.txt" />
      </head>
      <body className="antialiased">
        <SecurityShield />
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
