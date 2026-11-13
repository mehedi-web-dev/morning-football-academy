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
    title: "নতুন মৌসুম, নতুন প্রত্যয়ে আমাদের যাত্রা",
    category: "একাডেমি আপডেট",
    excerpt: "নতুন ফুটবল মৌসুমে আমাদের রোমাঞ্চকর পথচলা ও অর্জনের লক্ষ্য জানুন।",
    date: "২৮ অক্টোবর ২০২৬",
    readTime: "৪ মিনিট পাঠ",
    image: "/images/team.jpeg",
    imageAlt: "নতুন মৌসুমের সূচনায় Morning Football Academy স্কোয়াড",
    featured: true,
    author: {
      name: "একাডেমি সম্পাদকীয়",
      role: "ক্লাব মিডিয়া",
    },
    isDemo: true,
  },
  {
    id: "news-training-ground",
    slug: "inside-our-training-ground",
    title: "আমাদের প্রশিক্ষণ মাঠের অন্দরমহল",
    category: "প্রশিক্ষণ",
    excerpt: "আমাদের নিবিড় প্রশিক্ষণ সেশন, ট্যাকটিক্যাল ড্রিল এবং খেলোয়াড়দের প্রস্তুতির এক ঝলক।",
    date: "২৪ অক্টোবর ২০২৬",
    readTime: "৩ মিনিট পাঠ",
    image: "/images/team.jpeg",
    imageAlt: "Morning Football Academy-র ট্যাকটিক্যাল অনুশীলন সেশন",
    featured: false,
    author: {
      name: "টেকনিক্যাল স্টাফ",
      role: "কোচিং টিম",
    },
    isDemo: true,
  },
  {
    id: "news-next-generation",
    slug: "building-the-next-generation",
    title: "আগামীর প্রজন্ম গড়ে তোলার প্রতিশ্রুতি",
    category: "ক্লাব সংবাদ",
    excerpt: "ভবিষ্যতের পেশাদার ফুটবল তারকা গড়ে তুলতে আমাদের একাগ্র পরিকল্পনা ও নিবেদন।",
    date: "১৯ অক্টোবর ২০২৬",
    readTime: "৫ মিনিট পাঠ",
    image: "/images/team.jpeg",
    imageAlt: "মাঠে Morning Football Academy-র নিবেদিতপ্রাণ তরুণ ফুটবলার",
    featured: false,
    author: {
      name: "ইয়ুথ ডেভেলপমেন্ট",
      role: "একাডেমি স্টাফ",
    },
    isDemo: true,
  },
];
