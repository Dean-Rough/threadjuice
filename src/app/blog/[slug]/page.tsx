'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { QueryProvider } from '@/providers/QueryProvider';
import { TrendingUp, Trophy, BarChart3, ArrowUp, MessageCircle, Bookmark, Share2 } from 'lucide-react';

export default function BlogPost() {
  const params = useParams();
  const slug = params.slug as string;

  // Mock data for now - this would come from your Reddit API/database
  const post = {
    title: "AITA for telling my roommate her TikTok dances are ruining my Zoom calls?",
    category: "viral",
    author: "The Snarky Sage",
    date: "2 hours ago",
    image: "/assets/img/lifestyle/life_style01.jpg",
    content: `
      <p>Oh, Reddit. You never fail to deliver the kind of petty drama that makes my day infinitely more entertaining than whatever productivity seminar my boss thinks I should be watching.</p>
      
      <p>So here's the tea: Our protagonist works from home (shocking, I know) and shares an apartment with someone who has apparently confused TikTok fame with actual career aspirations. Roommate decided that the living room—you know, that shared space where normal people do normal things—is now her personal dance studio.</p>
      
      <h3>The Setup</h3>
      <p>Picture this: You're on a Zoom call with your boss, discussing quarterly reports or whatever soul-crushing corporate nonsense pays your bills. In the background, your roommate is practicing the latest dance trend with the enthusiasm of someone who genuinely believes 47 followers constitutes an audience.</p>
      
      <p>The kicker? She's doing this during OP's work hours. Not occasionally. Not once in a while. DAILY.</p>
      
      <h3>The Drama Unfolds</h3>
      <p>According to our frustrated narrator, they've tried subtle hints. They've tried closed doors. They've tried noise-canceling headphones. Nothing worked. Finally, they snapped and told roommate that her "content creation" was unprofessional and embarrassing.</p>
      
      <p>Roommate's response? "You're just jealous of my creative expression."</p>
      
      <p>*Chef's kiss* Perfect. Absolutely perfect.</p>
      
      <h3>Reddit's Verdict</h3>
      <p>The comments section didn't disappoint. Top response with 12K upvotes: "NTA. Your roommate needs to learn that 'influencer' isn't a personality trait."</p>
      
      <p>One commenter suggested charging her rent for using the living room as a studio. Another recommended getting a spray bottle. (I personally endorse the spray bottle method.)</p>
      
      <p>But my favorite response came from someone who apparently went through the same thing: "I solved this by joining in with deliberately terrible dancing every time she started. She stopped after three days."</p>
      
      <h3>The Takeaway</h3>
      <p>Look, we all need hobbies. We all need creative outlets. But if your creative outlet involves making your roommate look like they live in a frat house during professional video calls, maybe—just maybe—you're the problem.</p>
      
      <p>Also, 47 followers isn't a career. It's barely a hobby.</p>
      
      <p><em>Update: OP says they tried the terrible dancing method. Roommate now practices in her bedroom. Faith in petty justice: restored.</em></p>
    `
  };

  return (
    <QueryProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center space-x-2">
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
                </Link>
                <p className="text-muted-foreground">
                  Get ratio'd • The best stories from around the web
                </p>
              </div>
              <nav className="hidden md:flex space-x-6">
                <Link href="/" className="text-muted-foreground hover:text-foreground">Home</Link>
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

        {/* Main Content - Same layout as homepage */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content Area - matches homepage structure */}
            <div className="lg:col-span-3">
              
              {/* Story Image with Description */}
              <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="col-span-3">
                  <Image 
                    src={post.image} 
                    alt={post.title}
                    width={800}
                    height={400}
                    className="w-full h-auto rounded-lg object-cover"
                    priority
                  />
                </div>
                <div className="col-span-1 space-y-4">
                  <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                    A frustrated person working from home on a video call while their roommate practices TikTok dances in the background, perfectly capturing the chaos of shared living spaces.
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs font-mono">#reddit</span>
                    <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs font-mono">#aita</span>
                    <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs font-mono">#roommates</span>
                    <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs font-mono">#tiktok</span>
                  </div>
                </div>
              </div>

              {/* Headline and Author */}
              <div className="mb-8 space-y-4">
                <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-foreground">
                  {post.title}
                </h1>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                    S
                  </div>
                  <div>
                    <Link href={`/filter/author/${post.author.toLowerCase().replace(/ /g, '-')}`} className="font-bold text-foreground hover:text-orange-500 transition-colors">
                      {post.author}
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Link href={`/filter/category/${post.category.toLowerCase()}`} className="bg-orange-500 px-2 py-1 rounded text-white text-xs font-bold hover:bg-orange-600 transition-colors">
                        {post.category}
                      </Link>
                      <span>• {post.date}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Voting & Interaction Toolbar */}
              <div className="mb-8 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-6">
                  {/* Upvote */}
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-orange-500/10 transition-colors group">
                    <ArrowUp className="h-5 w-5 text-muted-foreground group-hover:text-orange-500" />
                    <span className="text-sm font-mono text-muted-foreground group-hover:text-orange-500">2.4k</span>
                  </button>

                  {/* Comments */}
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-500/10 transition-colors group">
                    <MessageCircle className="h-5 w-5 text-muted-foreground group-hover:text-blue-500" />
                    <span className="text-sm font-mono text-muted-foreground group-hover:text-blue-500">847</span>
                  </button>

                  {/* Bookmark */}
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-yellow-500/10 transition-colors group">
                    <Bookmark className="h-5 w-5 text-muted-foreground group-hover:text-yellow-500" />
                    <span className="text-sm font-mono text-muted-foreground group-hover:text-yellow-500">156</span>
                  </button>

                  {/* Share */}
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-green-500/10 transition-colors group">
                    <Share2 className="h-5 w-5 text-muted-foreground group-hover:text-green-500" />
                    <span className="text-sm font-mono text-muted-foreground group-hover:text-green-500">312</span>
                  </button>
                </div>
              </div>
              
              {/* Article Content */}
              <article className="space-y-8">
                
                {/* Section 1 */}
                <div className="space-y-4">
                  <h4 className="text-2xl font-extrabold text-foreground">The Setup</h4>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    Picture this: You're on a Zoom call with your boss, discussing quarterly reports or whatever soul-crushing corporate nonsense pays your bills. In the background, your roommate is practicing the latest dance trend with the enthusiasm of someone who genuinely believes 47 followers constitutes an audience.
                  </p>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    The kicker? She's doing this during OP's work hours. Not occasionally. Not once in a while. DAILY. Because apparently, the concept of "shared living space" translates to "my personal TikTok studio" in roommate logic.
                  </p>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    According to our frustrated narrator, they've tried subtle hints. They've tried closed doors. They've tried noise-canceling headphones. Nothing worked. The dancing continued with the relentless persistence of a toddler asking "why" for the 47th time.
                  </p>
                </div>

                <hr className="border-muted" />

                {/* Section 2 */}
                <div className="space-y-4">
                  <h4 className="text-2xl font-extrabold text-foreground">The Drama Unfolds</h4>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    Finally, they snapped and told roommate that her "content creation" was unprofessional and embarrassing. A reasonable response to an unreasonable situation, you might think. But oh, sweet summer child, you underestimate the power of TikTok delusion.
                  </p>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    Roommate's response? "You're just jealous of my creative expression." *Chef's kiss* Perfect. Absolutely perfect. Because nothing says "creative expression" like disrupting someone's livelihood for your 15 seconds of fame.
                  </p>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    The audacity is truly breathtaking. It's like claiming you're Picasso while finger-painting on someone else's walls. The self-awareness level? Approximately zero.
                  </p>
                </div>

                <hr className="border-muted" />

                {/* Reddit Comments Section */}
                <div className="space-y-6">
                  <h4 className="text-2xl font-extrabold text-foreground">Reddit's Verdict</h4>
                  
                  <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                    <div className="border-l-4 border-orange-500 pl-4">
                      <p className="font-semibold text-foreground">u/PettyJusticeWarrior • 12.3k upvotes</p>
                      <p className="text-lg italic">"NTA. Your roommate needs to learn that 'influencer' isn't a personality trait."</p>
                    </div>
                    
                    <div className="border-l-4 border-orange-500 pl-4">
                      <p className="font-semibold text-foreground">u/WorkFromHomeSurvivor • 8.7k upvotes</p>
                      <p className="text-lg italic">"I solved this by joining in with deliberately terrible dancing every time she started. She stopped after three days. Sometimes you fight fire with awkwardness."</p>
                    </div>
                    
                    <div className="border-l-4 border-orange-500 pl-4">
                      <p className="font-semibold text-foreground">u/SprayBottleHero • 6.2k upvotes</p>
                      <p className="text-lg italic">"Get a spray bottle. Works on cats, should work on wannabe TikTokers. 🧴"</p>
                    </div>
                  </div>
                  
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    The comments section didn't disappoint. One commenter suggested charging her rent for using the living room as a studio. Another recommended the spray bottle method (which I personally endorse). But the real MVP suggested joining in with deliberately terrible dancing—petty justice at its finest.
                  </p>
                </div>

                <hr className="border-muted" />

                {/* Similar Stories */}
                <div className="bg-orange-500 rounded-lg p-6 text-white space-y-4">
                  <h4 className="text-2xl font-extrabold">More Roommate Horror Stories</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Link href="#" className="bg-white/20 rounded-lg p-4 hover:bg-white/30 transition-colors">
                      <h5 className="font-bold mb-2">My roommate replaced all my furniture with cardboard replicas</h5>
                      <p className="text-sm opacity-90 mb-3">The most elaborate prank or mental breakdown? You decide.</p>
                      <div className="flex flex-wrap gap-1">
                        <span className="bg-white/30 text-white px-2 py-1 rounded text-xs font-mono">#roommates</span>
                        <span className="bg-white/30 text-white px-2 py-1 rounded text-xs font-mono">#prank</span>
                        <span className="bg-white/30 text-white px-2 py-1 rounded text-xs font-mono">#wtf</span>
                      </div>
                    </Link>
                    <Link href="#" className="bg-white/20 rounded-lg p-4 hover:bg-white/30 transition-colors">
                      <h5 className="font-bold mb-2">Roommate started an OnlyFans in our shared living room</h5>
                      <p className="text-sm opacity-90 mb-3">Plot twist: She forgot to tell the other 3 roommates.</p>
                      <div className="flex flex-wrap gap-1">
                        <span className="bg-white/30 text-white px-2 py-1 rounded text-xs font-mono">#roommates</span>
                        <span className="bg-white/30 text-white px-2 py-1 rounded text-xs font-mono">#awkward</span>
                        <span className="bg-white/30 text-white px-2 py-1 rounded text-xs font-mono">#boundaries</span>
                      </div>
                    </Link>
                    <Link href="#" className="bg-white/20 rounded-lg p-4 hover:bg-white/30 transition-colors">
                      <h5 className="font-bold mb-2">My roommate thinks she's a food influencer</h5>
                      <p className="text-sm opacity-90 mb-3">Spoiler: She burns water and photographs moldy cheese.</p>
                      <div className="flex flex-wrap gap-1">
                        <span className="bg-white/30 text-white px-2 py-1 rounded text-xs font-mono">#cooking</span>
                        <span className="bg-white/30 text-white px-2 py-1 rounded text-xs font-mono">#influencer</span>
                        <span className="bg-white/30 text-white px-2 py-1 rounded text-xs font-mono">#fail</span>
                      </div>
                    </Link>
                    <Link href="#" className="bg-white/20 rounded-lg p-4 hover:bg-white/30 transition-colors">
                      <h5 className="font-bold mb-2">AITA for hiding my roommate's ring light?</h5>
                      <p className="text-sm opacity-90 mb-3">Sometimes desperate times call for desperate measures.</p>
                      <div className="flex flex-wrap gap-1">
                        <span className="bg-white/30 text-white px-2 py-1 rounded text-xs font-mono">#aita</span>
                        <span className="bg-white/30 text-white px-2 py-1 rounded text-xs font-mono">#petty</span>
                        <span className="bg-white/30 text-white px-2 py-1 rounded text-xs font-mono">#revenge</span>
                      </div>
                    </Link>
                  </div>
                </div>

                <hr className="border-muted" />

                {/* More Reddit Comments Section */}
                <div className="space-y-6">
                  <h4 className="text-2xl font-extrabold text-foreground">More Reddit Reactions</h4>
                  
                  <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                    <div className="border-l-4 border-orange-500 pl-4">
                      <p className="font-semibold text-foreground">u/ZoomCallSurvivor • 4.1k upvotes</p>
                      <p className="text-lg italic">"This is why I moved out. My roommate thought our kitchen was a cooking show set. She'd literally narrate making cereal."</p>
                    </div>
                    
                    <div className="border-l-4 border-orange-500 pl-4">
                      <p className="font-semibold text-foreground">u/ProfessionalBoundaries • 3.8k upvotes</p>
                      <p className="text-lg italic">"Start charging her studio rental fees. $50/hour for living room usage during work hours. See how creative she gets then."</p>
                    </div>
                    
                    <div className="border-l-4 border-orange-500 pl-4">
                      <p className="font-semibold text-foreground">u/TikTokTrauma • 2.9k upvotes</p>
                      <p className="text-lg italic">"I'm crying 😂 This is giving me flashbacks to my college roommate who thought she was the next big YouTuber. Spoiler: She wasn't."</p>
                    </div>

                    <div className="border-l-4 border-orange-500 pl-4">
                      <p className="font-semibold text-foreground">u/WorkFromHomeWarrior • 2.3k upvotes</p>
                      <p className="text-lg italic">"The secondhand embarrassment is REAL. I would have lost it on day one. Your patience is admirable, OP."</p>
                    </div>
                  </div>
                </div>

                <hr className="border-muted" />

                {/* Closing Comment */}
                <div className="space-y-4">
                  <p className="text-xl leading-relaxed text-foreground font-medium">
                    Look, we all need hobbies. We all need creative outlets. But if your creative outlet involves making your roommate look like they live in a frat house during professional video calls, maybe—just maybe—you're the problem.
                  </p>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    Also, 47 followers isn't a career. It's barely a hobby. But hey, at least we got some premium entertainment out of it.
                  </p>
                  <p className="text-lg leading-relaxed text-muted-foreground italic">
                    <strong>Update:</strong> OP says they tried the terrible dancing method. Roommate now practices in her bedroom. Faith in petty justice: restored.
                  </p>
                </div>

                <hr className="border-muted" />

                {/* Author Info & Tags */}
                <div className="bg-muted/30 rounded-lg p-6 space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      S
                    </div>
                    <div className="flex-1">
                      <h5 className="text-lg font-extrabold text-foreground">{post.author}</h5>
                      <p className="text-muted-foreground">
                        The Snarky Sage delivers Reddit's most entertaining drama with a side of brutal honesty. 
                        Professional chaos observer and part-time life coach for people who probably shouldn't take advice.
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span>📍 Internet</span>
                        <span>📚 127 Stories</span>
                        <span>⭐ 4.8/5 Sass Rating</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-muted">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm font-semibold text-muted-foreground">Tags:</span>
                      <Link href="/category/reddit" className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm hover:bg-secondary/80 font-mono">#reddit</Link>
                      <Link href="/category/aita" className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm hover:bg-secondary/80 font-mono">#aita</Link>
                      <Link href="/category/roommates" className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm hover:bg-secondary/80 font-mono">#roommates</Link>
                      <Link href="/category/tiktok" className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm hover:bg-secondary/80 font-mono">#tiktok</Link>
                      <Link href="/category/workfromhome" className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm hover:bg-secondary/80 font-mono">#workfromhome</Link>
                    </div>
                  </div>
                </div>

                <hr className="border-muted my-8" />

                {/* Bottom Voting & Interaction Toolbar */}
                <div className="mb-8 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      {/* Upvote */}
                      <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-orange-500/10 transition-colors group">
                        <ArrowUp className="h-5 w-5 text-muted-foreground group-hover:text-orange-500" />
                        <span className="text-sm font-mono text-muted-foreground group-hover:text-orange-500">2.4k</span>
                      </button>

                      {/* Comments */}
                      <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-500/10 transition-colors group">
                        <MessageCircle className="h-5 w-5 text-muted-foreground group-hover:text-blue-500" />
                        <span className="text-sm font-mono text-muted-foreground group-hover:text-blue-500">847</span>
                      </button>

                      {/* Bookmark */}
                      <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-yellow-500/10 transition-colors group">
                        <Bookmark className="h-5 w-5 text-muted-foreground group-hover:text-yellow-500" />
                        <span className="text-sm font-mono text-muted-foreground group-hover:text-yellow-500">156</span>
                      </button>

                      {/* Share */}
                      <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-green-500/10 transition-colors group">
                        <Share2 className="h-5 w-5 text-muted-foreground group-hover:text-green-500" />
                        <span className="text-sm font-mono text-muted-foreground group-hover:text-green-500">312</span>
                      </button>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      Enjoyed this story? Let others know!
                    </div>
                  </div>
                </div>

              </article>
            </div>

            {/* Trending Sidebar */}
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
                  <li><Link href="/" className="text-muted-foreground hover:text-foreground">Trending Stories</Link></li>
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