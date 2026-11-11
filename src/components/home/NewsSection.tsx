"use client";

import Image from "next/image";
import { Chip } from "@heroui/react";
import { Calendar, Clock, Newspaper } from "lucide-react";
import { DEMO_NEWS_ARTICLES, NewsArticle } from "../../data/news";

/**
 * Featured Primary Article Card Component
 * Cinematic large-format sports editorial card with gradient vignette
 */
function FeaturedArticleCard({ article }: { article: NewsArticle }) {
  return (
    <div
      className="group relative flex flex-col h-full rounded-3xl bg-[#18251F] border border-white/10 overflow-hidden transition-all duration-300 hover:border-[#B9F66B]/50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)] cursor-default"
      aria-label={`Featured article: ${article.title}`}
    >
      <div className="relative w-full h-full min-h-[440px] sm:min-h-[500px] lg:min-h-[560px] flex flex-col justify-between overflow-hidden">
        {/* Real Local Football Image */}
        <Image
          src={article.image}
          alt={article.imageAlt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 58vw"
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Multi-Stop Cinematic Vignette Overlays for Maximum Editorial Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#101A17] via-[#101A17]/70 to-[#101A17]/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#101A17]/60 via-transparent to-[#101A17]/30" />

        {/* Top Bar: Category, Date & Demo Tag */}
        <div className="relative z-10 p-5 sm:p-7 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Chip
              className="bg-[#101A17]/90 backdrop-blur-md text-[#B9F66B] border border-[#B9F66B]/40 font-black tracking-[0.22em] text-[10px] sm:text-[11px] uppercase px-3 py-1 shadow-md"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B] shadow-[0_0_8px_#B9F66B] mr-1.5 inline-block" />
              {article.category}
            </Chip>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#101A17]/80 backdrop-blur-md border border-white/10 text-[11px] font-mono text-[#A4B0A8] uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-[#B9F66B]" />
              {article.date}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#B9F66B]/15 border border-[#B9F66B]/30 text-[10px] font-mono font-black text-[#B9F66B] uppercase tracking-wider">
            FEATURED
          </span>
        </div>

        {/* Bottom Editorial Content Overlay */}
        <div className="relative z-10 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-[#A4B0A8]">
            <Clock className="w-3.5 h-3.5 text-[#B9F66B]" />
            <span>{article.readTime}</span>
            <span className="text-white/20">•</span>
            <span>BY {article.author.name.toUpperCase()}</span>
          </div>

          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight leading-tight group-hover:text-[#B9F66B] transition-colors duration-300">
            {article.title}
          </h3>

          <p className="text-sm sm:text-base text-[#A4B0A8] max-w-xl line-clamp-3 leading-relaxed">
            {article.excerpt}
          </p>

          <div className="pt-2 flex items-center justify-between border-t border-white/10">
            <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-black tracking-[0.16em] uppercase text-[#B9F66B]">
              <span>FEATURE STORY</span>
            </span>

            <span className="text-[11px] font-mono text-[#A4B0A8]/60 uppercase tracking-widest">
              DEMO ARTICLE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Supporting Horizontal Article Card Component
 * Sleek compact sports journalism card with thumbnail and metadata
 */
function SupportingArticleCard({ article }: { article: NewsArticle }) {
  return (
    <div
      className="group flex flex-col sm:flex-row rounded-2xl bg-[#18251F] border border-white/10 overflow-hidden transition-all duration-300 hover:border-[#B9F66B]/40 hover:shadow-[0_12px_36px_rgba(0,0,0,0.5)] cursor-default"
      aria-label={`Article: ${article.title}`}
    >
      {/* Article Thumbnail */}
      <div className="relative w-full sm:w-48 lg:w-52 aspect-[16/10] sm:aspect-auto sm:min-h-[220px] shrink-0 overflow-hidden bg-[#101A17]">
        <Image
          src={article.image}
          alt={article.imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 200px, 220px"
          className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-108"
        />
        {/* Subtle Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-[#18251F] via-[#18251F]/40 to-transparent" />

        {/* Floating Category Pill on Mobile */}
        <div className="sm:hidden absolute top-3 left-3 z-10">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#101A17]/90 backdrop-blur-md border border-[#B9F66B]/40 text-[10px] font-black tracking-wider text-[#B9F66B] uppercase">
            {article.category}
          </span>
        </div>
      </div>

      {/* Article Body Details */}
      <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 space-y-3">
        <div className="space-y-2.5">
          {/* Header Row: Category Badge & Date */}
          <div className="flex items-center justify-between gap-2">
            <div className="hidden sm:block">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#101A17] border border-[#B9F66B]/30 text-[10px] font-black tracking-wider text-[#B9F66B] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B]" />
                {article.category}
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono text-[#A4B0A8]">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#B9F66B]" />
                {article.date}
              </span>
              <span className="text-white/20">•</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#A4B0A8]" />
                {article.readTime}
              </span>
            </div>
          </div>

          {/* Article Title */}
          <h4 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight group-hover:text-[#B9F66B] transition-colors duration-200 line-clamp-2">
            {article.title}
          </h4>

          {/* Article Excerpt */}
          <p className="text-xs sm:text-sm text-[#A4B0A8] line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        </div>

        {/* Read More Link */}
        <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs font-black tracking-[0.14em] uppercase text-[#B9F66B]">
            <span>ACADEMY DISPATCH</span>
          </span>

          <span className="text-[10px] font-mono text-[#A4B0A8]/50 uppercase tracking-wider">
            DEMO
          </span>
        </div>
      </div>
    </div>
  );
}

export default function NewsSection() {
  const featuredArticle =
    DEMO_NEWS_ARTICLES.find((article) => article.featured) || DEMO_NEWS_ARTICLES[0];
  const supportingArticles = DEMO_NEWS_ARTICLES.filter(
    (article) => article.id !== featuredArticle.id
  );

  return (
    <section
      id="news"
      className="relative w-full py-16 sm:py-20 lg:py-28 bg-[#101A17] text-white border-t border-white/[0.08] overflow-hidden"
      aria-labelledby="news-section-heading"
    >
      {/* Background Dark Green & Lime Glow Atmospherics */}
      <div className="absolute top-1/3 -right-48 w-96 h-96 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#B9F66B]/5 via-[#18251F]/20 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-48 w-[400px] h-[400px] rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0d2a17]/30 via-transparent to-transparent blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* 1. Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-4 border-b border-white/[0.06]">
          <div className="space-y-3">
            {/* Eyebrow Badge */}
            <div className="flex flex-wrap items-center gap-3">
              <Chip
                className="bg-[#18251F] text-[#B9F66B] border border-[#B9F66B]/30 font-black tracking-[0.24em] text-[11px] uppercase px-3 py-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#B9F66B] shadow-[0_0_8px_#B9F66B] mr-1.5 inline-block" />
                CLUB JOURNAL
              </Chip>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#A4B0A8] uppercase tracking-wider">
                <Newspaper className="w-3.5 h-3.5 text-[#B9F66B]" />
                PRESS & DISPATCHES
              </span>
            </div>

            {/* Main Heading */}
            <h2
              id="news-section-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase"
            >
              LATEST NEWS.
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base text-[#A4B0A8] max-w-2xl leading-relaxed">
              Stories, updates, and moments from our journey.
            </p>
          </div>
        </div>

        {/* 2. News Layout Grid (1 Large Featured on Left, 2 Stacked Supporting on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Featured Article (Left - 7 cols) */}
          <div className="lg:col-span-7 flex flex-col">
            <FeaturedArticleCard article={featuredArticle} />
          </div>

          {/* Supporting Articles (Right - 5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            {supportingArticles.map((article) => (
              <SupportingArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>

        {/* 3. Demonstration Content Disclaimer Footer */}
        <div className="pt-2 text-center border-t border-white/[0.06]">
          <p className="text-[11px] text-[#A4B0A8]/60 uppercase tracking-widest font-mono">
            * Demonstration articles created for interface evaluation. Official club press
            announcements and match day programs will be broadcast through this portal.
          </p>
        </div>
      </div>
    </section>
  );
}
