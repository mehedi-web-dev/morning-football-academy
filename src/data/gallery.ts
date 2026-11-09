/**
 * Football Gallery Data Model & Demonstration Records
 *
 * DEMO CONTENT NOTICE:
 * All gallery moments, titles, and media captions in this file represent
 * temporary demonstration assets for platform showcase and UI evaluation.
 */

export type GalleryCategory =
  | "MATCH DAY"
  | "TRAINING"
  | "TEAM MOMENTS"
  | "STADIUM"
  | "CELEBRATIONS"
  | "ACADEMY LIFE";

export interface GalleryItem {
  id: string;
  image: string;
  category: GalleryCategory;
  title: string;
  alt: string;
  caption?: string;
  featured?: boolean;
  date?: string;
}

export const GALLERY_CATEGORIES: Array<"ALL" | GalleryCategory> = [
  "ALL",
  "MATCH DAY",
  "TRAINING",
  "TEAM MOMENTS",
  "STADIUM",
  "CELEBRATIONS",
  "ACADEMY LIFE",
];

export const DEMO_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "gallery-team-moments",
    image: "/images/team.jpeg",
    category: "TEAM MOMENTS",
    title: "Official Academy Squad Lineup",
    alt: "Morning Football Academy squad assembled together on the pitch for official team photograph",
    caption:
      "The complete Morning Football Academy roster standing unified ahead of the new competitive tournament season.",
    featured: true,
    date: "OCT 2026",
  },
  {
    id: "gallery-stadium-floodlights",
    image: "/images/stadium-hero.jpg",
    category: "STADIUM",
    title: "Home Arena Under Floodlights",
    alt: "Morning Football Academy home pitch illuminated under evening floodlights",
    caption:
      "Our premier academy training ground and match arena illuminated for evening tactical preparations.",
    featured: false,
    date: "OCT 2026",
  },
  {
    id: "gallery-match-day-action",
    image: "/images/players/player-4.jpg",
    category: "MATCH DAY",
    title: "Matchday Between The Posts",
    alt: "Morning Football Academy goalkeeper in commanding position during championship match",
    caption:
      "Intense concentration and commanding penalty box presence during our key youth league encounter.",
    featured: false,
    date: "NOV 2026",
  },
  {
    id: "gallery-training-drills",
    image: "/images/players/player-3.jpg",
    category: "TRAINING",
    title: "Tactical Conditioning & Drills",
    alt: "Morning Football Academy player performing disciplined agility and defensive drills",
    caption:
      "Daily technical routines sharpening tactical awareness, pressing speed, and athletic stamina.",
    featured: false,
    date: "NOV 2026",
  },
  {
    id: "gallery-celebrations-triumph",
    image: "/images/players/test.jpg",
    category: "CELEBRATIONS",
    title: "Triumph & Team Chemistry",
    alt: "Morning Football Academy athlete celebrating hard-earned victory",
    caption:
      "Pure passion and celebration following a hard-earned derby triumph on home turf.",
    featured: false,
    date: "OCT 2026",
  },
  {
    id: "gallery-academy-life-talent",
    image: "/images/players/player-1.jpg",
    category: "ACADEMY LIFE",
    title: "Developing Future Stars",
    alt: "Young Morning Football Academy talent focused during coaching session",
    caption:
      "Fostering athletic discipline, personal character, and footballing intellect on and off the field.",
    featured: false,
    date: "NOV 2026",
  },
];
