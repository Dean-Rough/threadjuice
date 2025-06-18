'use client';

import Link from 'next/link';
import { QueryProvider } from '@/providers/QueryProvider';
import { TrendingFeed } from '@/components/TrendingFeed';
import { HeroCarousel } from '@/components/HeroCarousel';
import { TrendingUp, Trophy, Share2 } from 'lucide-react';

export default function HomePage() {
  return (
    <QueryProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <img 
                    src="/assets/img/logo/Icon.svg" 
                    alt="ThreadJuice Icon" 
                    className="h-16 w-16"
                  />
                  <img 
                    src="/assets/img/logo/Logotype-White.svg" 
                    alt="ThreadJuice" 
                    className="h-12"
                  />
                </div>
                <p className="text-muted-foreground">
                  Get ratio'd • The best stories from around the web
                </p>
              </div>
              <nav className="hidden md:flex space-x-6">
                <a href="#" className="text-muted-foreground hover:text-foreground">Trending</a>
                <a href="#" className="text-muted-foreground hover:text-foreground">Latest</a>
                <a href="#" className="text-muted-foreground hover:text-foreground">Popular</a>
              </nav>
            </div>
          </div>
          
          {/* Category Ticker */}
          <div className="bg-orange-500 py-3 overflow-hidden">
            <div className="animate-scroll-left flex items-center space-x-4 whitespace-nowrap">
              {[
                'AITA', 'Revenge', 'Funny', 'News', 'Relationships', 'Work Stories', 'Malicious Compliance',
                'Petty Revenge', 'TikTok Fails', 'Roommate Drama', 'Dating Disasters', 'Food Fails',
                'Technology', 'Travel', 'DIY Disasters', 'Wedding Drama', 'Family Drama', 'School Stories',
                'AITA', 'Revenge', 'Funny', 'News', 'Relationships', 'Work Stories', 'Malicious Compliance',
                'Petty Revenge', 'TikTok Fails', 'Roommate Drama', 'Dating Disasters', 'Food Fails'
              ].map((category, index) => (
                <Link
                  key={index}
                  href={`/filter/category/${category.toLowerCase().replace(/ /g, '-')}`}
                  className="bg-black text-white px-4 py-2 rounded-full text-sm font-extrabold whitespace-nowrap hover:bg-gray-800 transition-colors"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </header>

        {/* Hero Carousel */}
        <HeroCarousel />

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-foreground mb-2 flex items-center gap-2">
                  <TrendingUp className="h-8 w-8 text-orange-500" />
                  Trending Stories
                </h2>
                <p className="text-muted-foreground">
                  Internet drama, wild stories, and everything in between
                </p>
              </div>

              <TrendingFeed />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="bg-card border rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-extrabold text-foreground mb-4 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-orange-500" />
                    Today's Top 5
                  </h3>
                  <div className="space-y-4">
                    {[
                      "Restaurant charged me $50 for 'emotional labor'",
                      "Neighbor steals packages, gets glitter bombed", 
                      "Working from Disneyland instead of home",
                      "Roommate replaced furniture with cardboard",
                      "Boyfriend catfished me with better photos"
                    ].map((title, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <p className="text-sm text-foreground font-medium leading-tight">
                          {title}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card border rounded-lg p-6">
                  <h3 className="text-lg font-extrabold text-foreground mb-4 flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-orange-500" />
                    Top Shared
                  </h3>
                  <div className="space-y-4">
                    {[
                      { title: "My landlord installed a doorbell that plays 'Baby Shark'", shares: "3.2k" },
                      { title: "I accidentally became the town's food critic", shares: "2.8k" },
                      { title: "My dating app match was my therapist's patient", shares: "2.1k" },
                      { title: "Living in an Airbnb for 8 months (host forgot)", shares: "1.9k" },
                      { title: "Ex trying to copyright my breakup letter", shares: "1.7k" }
                    ].map((story, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                        <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-foreground font-medium leading-tight mb-1">
                            {story.title}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {story.shares} shares
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t mt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-4 gap-8">
              {/* Logo & Description - 25% */}
              <div>
                <img 
                  src="/assets/img/logo/Logotype-White.svg" 
                  alt="ThreadJuice" 
                  className="h-10 mb-4"
                />
                <p className="text-muted-foreground text-sm">
                  Your daily dose of internet chaos, wholesome moments, and "wait, what?" stories. 
                  We find the stuff that makes you stop scrolling and actually read the comments.
                </p>
              </div>
              
              {/* Blank Space - 25% */}
              <div></div>
              
              {/* Explore - 25% */}
              <div>
                <h3 className="font-extrabold text-foreground mb-4">Explore</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Trending Stories</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Latest Posts</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Popular Today</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Categories</a></li>
                </ul>
              </div>
              
              {/* About - 25% */}
              <div>
                <h3 className="font-extrabold text-foreground mb-4">About</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Our Writers</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Content Policy</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Privacy</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Contact</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t pt-8 mt-8 text-center">
              <p className="text-muted-foreground text-sm">
                © 2024 ThreadJuice. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </QueryProvider>
  );
}