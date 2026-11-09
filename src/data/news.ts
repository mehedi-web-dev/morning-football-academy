/**
 * News Articles Data Model & Demonstration Records
 *
 * DEMO CONTENT NOTICE:
 * All articles, dates, and journalistic excerpts in this file are temporary
 * demonstration content for platform showcase and UI evaluation.
 * They do not represent official club press releases or verified news events.
 */

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  category: "ACADEMY UPDATE" | "TRAINING" | "CLUB NEWS" | string;
  excerpt: string;
  date: string;
  readTime: string;
  image: string;
  imageAlt: string;
  featured?: boolean;
  author: {
    name: string;
    role: string;
  };
  isDemo?: boolean;
}

export const DEMO_NEWS_ARTICLES: NewsArticle[] = [
  {
    id: "news-season-beginning",
    slug: "a-new-season-a-new-beginning",
    title: "A New Season, A New Beginning",
    category: "ACADEMY UPDATE",
    excerpt: "Discover our journey and ambitions for the new season.",
    date: "OCT 28, 2026",
    readTime: "4 MIN READ",
    image: "/images/team.jpeg",
    imageAlt: "Morning Football Academy squad assembled together for the opening of the competitive season",
    featured: true,
    author: {
      name: "Academy Editorial",
      role: "Club Media",
    },
    isDemo: true,
  },
  {
    id: "news-training-ground",
    slug: "inside-our-training-ground",
    title: "Inside Our Training Ground",
    category: "TRAINING",
    excerpt: "A closer look at our training sessions and preparation.",
    date: "OCT 24, 2026",
    readTime: "3 MIN READ",
    image: "/images/stadium-hero.jpg",
    imageAlt: "Morning Football Academy training pitch lit by evening floodlights during tactical drills",
    featured: false,
    author: {
      name: "Technical Staff",
      role: "Coaching Team",
    },
    isDemo: true,
  },
  {
    id: "news-next-generation",
    slug: "building-the-next-generation",
    title: "Building The Next Generation",
    category: "CLUB NEWS",
    excerpt: "Our commitment to developing future football talent.",
    date: "OCT 19, 2026",
    readTime: "5 MIN READ",
    image: "/images/players/player-1.jpg",
    imageAlt: "Morning Football Academy youth athlete training on the pitch with dedicated discipline",
    featured: false,
    author: {
      name: "Youth Development",
      role: "Academy Staff",
    },
    isDemo: true,
  },
];
