'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Eye,
  MessageCircle,
  Share2,
  Clock,
  ArrowUp,
  Bookmark,
  User,
  CheckCircle,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Award,
  Reply,
  Quote,
  Play,
} from 'lucide-react';
import { InlineAd, SidebarAd } from '@/components/ads';
import TwitterQuote from '@/components/ui/TwitterQuote';
import TwitterConversation from '@/components/ui/TwitterConversation';
import AnimatedSpeechBubble from '@/components/ui/AnimatedSpeechBubble';
import { renderContentWithLinks } from '@/lib/contentLinkParser';
import HoverLink from '@/components/ui/HoverLink';
import { contentQualityChecker, ContentQualityMetrics } from '@/lib/contentQualityChecker';
import { sentimentAnalyzer, EmotionalAnalysis } from '@/lib/sentimentAnalyzer';
import { metaphorExtractor, MetaphorInsight } from '@/lib/metaphorExtractor';
import { giphyService, GifResult } from '@/lib/klipyService';
import GifReaction from '@/components/ui/GifReaction';
import { renderAdditionalSections } from './renderSections';
import { usePostsByCategory } from '@/hooks/usePosts';
import YouTubeEmbed from '@/components/embeds/YouTubeEmbed';
import TwitterEmbed from '@/components/embeds/TwitterEmbed';
import TikTokEmbed from '@/components/embeds/TikTokEmbed';

interface PostDetailProps {
  postId: string;
  showSidebar?: boolean;
  showRelated?: boolean;
}

// Define all categories for automatic linking
const CATEGORIES = [
  'AITA', 'revenge', 'funny', 'news', 'relationships', 'work stories',
  'malicious compliance', 'tiktok fails', 'roommate drama', 'food fails',
  'politics', 'sports', 'technology', 'celebrity', 'business', 'workplace',
  'education', 'travel', 'food', 'parenting', 'social', 'health',
  'environment', 'gaming', 'legal', 'housing', 'money'
];

// Helper function to render content with automatic category links
const renderContentWithAutoLinks = (content: string, post: any) => {
  // Pattern to match "Originally posted by [username] on [platform]"
  const sourcePattern = /Originally posted by ([\w@\/\-_]+) on (\w+)/gi;
  
  // Pattern for categories (case insensitive)
  const categoryPattern = new RegExp(`\\b(${CATEGORIES.join('|')})\\b`, 'gi');
  
  // Pattern for Reddit usernames
  const redditUserPattern = /\bu\/[\w\-_]+\b/g;
  
  // Pattern for Twitter handles
  const twitterHandlePattern = /@[\w]+\b/g;
  
  // Pattern for subreddits
  const subredditPattern = /\br\/[\w]+\b/g;
  
  const processedContent = content;
  const replacements: Array<{start: number, end: number, element: React.ReactNode}> = [];
  
  // Process source links
  let match;
  while ((match = sourcePattern.exec(content)) !== null) {
    const username = match[1];
    const platform = match[2];
    
    replacements.push({
      start: match.index,
      end: match.index + match[0].length,
      element: (
        <span key={`source-${match.index}`}>
          Originally posted by{' '}
          <HoverLink
            href={post.sourceUrl || '#'}
            external={true}
            className="text-orange-500 hover:text-orange-600 underline"
          >
            {username}
          </HoverLink>
          {' on '}
          <HoverLink
            href={post.sourceUrl || '#'}
            external={true}
            className="text-orange-500 hover:text-orange-600 underline"
          >
            {platform}
          </HoverLink>
        </span>
      )
    });
  }
  
  // Process category links
  while ((match = categoryPattern.exec(content)) !== null) {
    const category = match[1];
    const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
    
    // Skip if this overlaps with a source link
    const overlaps = replacements.some(r => 
      (match.index >= r.start && match.index < r.end) ||
      (match.index + match[0].length > r.start && match.index + match[0].length <= r.end)
    );
    
    if (!overlaps) {
      replacements.push({
        start: match.index,
        end: match.index + match[0].length,
        element: (
          <Link
            key={`category-${match.index}`}
            href={`/filter/category/${categorySlug}`}
            className="text-orange-500 hover:text-orange-600"
          >
            {match[0]}
          </Link>
        )
      });
    }
  }
  
  // Process Reddit usernames
  while ((match = redditUserPattern.exec(content)) !== null) {
    const username = match[0];
    
    // Skip if this overlaps with existing replacements
    const overlaps = replacements.some(r => 
      (match.index >= r.start && match.index < r.end) ||
      (match.index + match[0].length > r.start && match.index + match[0].length <= r.end)
    );
    
    if (!overlaps) {
      replacements.push({
        start: match.index,
        end: match.index + match[0].length,
        element: (
          <HoverLink
            key={`reddit-${match.index}`}
            href={`https://reddit.com/${username}`}
            external={true}
            className="text-blue-500 hover:text-blue-600"
          >
            {username}
          </HoverLink>
        )
      });
    }
  }
  
  // Process Twitter handles
  while ((match = twitterHandlePattern.exec(content)) !== null) {
    const handle = match[0];
    
    // Skip if this overlaps with existing replacements
    const overlaps = replacements.some(r => 
      (match.index >= r.start && match.index < r.end) ||
      (match.index + match[0].length > r.start && match.index + match[0].length <= r.end)
    );
    
    if (!overlaps) {
      replacements.push({
        start: match.index,
        end: match.index + match[0].length,
        element: (
          <HoverLink
            key={`twitter-${match.index}`}
            href={`https://twitter.com/${handle.substring(1)}`}
            external={true}
            className="text-blue-400 hover:text-blue-500"
          >
            {handle}
          </HoverLink>
        )
      });
    }
  }
  
  // Process subreddits
  while ((match = subredditPattern.exec(content)) !== null) {
    const subreddit = match[0];
    
    // Skip if this overlaps with existing replacements
    const overlaps = replacements.some(r => 
      (match.index >= r.start && match.index < r.end) ||
      (match.index + match[0].length > r.start && match.index + match[0].length <= r.end)
    );
    
    if (!overlaps) {
      replacements.push({
        start: match.index,
        end: match.index + match[0].length,
        element: (
          <HoverLink
            key={`subreddit-${match.index}`}
            href={`https://reddit.com/${subreddit}`}
            external={true}
            className="text-orange-500 hover:text-orange-600"
          >
            {subreddit}
          </HoverLink>
        )
      });
    }
  }
  
  // Sort replacements by start position (reverse order for easier processing)
  replacements.sort((a, b) => b.start - a.start);
  
  // Build the final content with replacements
  const parts = [];
  let lastEnd = content.length;
  
  for (const replacement of replacements) {
    if (replacement.end < lastEnd) {
      // Add text after this replacement
      const textAfter = content.substring(replacement.end, lastEnd);
      if (textAfter) {
        parts.unshift(renderContentWithLinks(textAfter));
      }
    }
    
    // Add the replacement
    parts.unshift(replacement.element);
    
    lastEnd = replacement.start;
  }
  
  // Add any remaining text at the beginning
  if (lastEnd > 0) {
    const textBefore = content.substring(0, lastEnd);
    parts.unshift(renderContentWithLinks(textBefore));
  }
  
  return parts.length > 0 ? <>{parts}</> : renderContentWithLinks(content);
};

export default function SimplePostDetail({
  postId,
  showSidebar = true,
  showRelated = true,
}: PostDetailProps) {
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [relatedStories, setRelatedStories] = useState<any[]>([]);
  const [contentQuality, setContentQuality] = useState<ContentQualityMetrics | null>(null);
  const [adaptiveSections, setAdaptiveSections] = useState<any[]>([]);
  const [emotionalAnalysis, setEmotionalAnalysis] = useState<EmotionalAnalysis[]>([]);
  const [metaphorInsight, setMetaphorInsight] = useState<MetaphorInsight | null>(null);
  const [showTerrysBubble, setShowTerrysBubble] = useState(false);

  // Helper function to format view/comment counts - memoized
  const formatCount = useCallback((count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  }, []);

  // Determine if we should insert a GIF reaction at this point
  const shouldInsertGifReaction = (
    emotion: EmotionalAnalysis,
    sectionIndex: number,
    totalSections: number
  ): boolean => {
    // Insert GIFs for high-intensity emotions
    if (emotion.intensity >= 0.6) return true;
    
    // Insert at peak moments (around 40-80% through the story)
    const storyProgress = sectionIndex / totalSections;
    if (storyProgress >= 0.4 && storyProgress <= 0.8 && emotion.intensity >= 0.4) return true;
    
    // Insert for specific high-impact emotions
    const highImpactEmotions = ['peak_chaos', 'escalating_drama', 'pure_entertainment', 'twist', 'climax'];
    if (highImpactEmotions.includes(emotion.emotion)) return true;
    
    // Always insert at least one GIF if we're past the middle
    if (storyProgress >= 0.5 && Math.random() < 0.3) return true;
    
    return false;
  };

  // Generate appropriate caption for GIF based on emotion
  const getGifCaption = (emotion: EmotionalAnalysis): string => {
    const captions: { [key: string]: string[] } = {
      'opening_tension': [
        "Everyone watching this unfold:",
        "The vibes right now:",
        "Here we go..."
      ],
      'escalating_drama': [
        "Everyone in the replies:",
        "The collective reaction:",
        "This is getting spicy:"
      ],
      'peak_chaos': [
        "Literally everyone right now:",
        "The entire internet:",
        "All of us watching this:"
      ],
      'pure_entertainment': [
        "Us enjoying the show:",
        "Peak entertainment:",
        "This is why we're here:"
      ],
      'resolution': [
        "How we're all feeling:",
        "The aftermath:",
        "When the dust settles:"
      ]
    };

    const emotionCaptions = captions[emotion.emotion] || ["Everyone right now:"];
    return emotionCaptions[Math.floor(Math.random() * emotionCaptions.length)];
  };

  // Enhance story with contextual GIF reactions - properly memoized
  const enhanceStoryWithGifs = useCallback(async (
    sections: any[],
    emotions: EmotionalAnalysis[]
  ): Promise<any[]> => {
    const enhancedSections: any[] = [];

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      enhancedSections.push(section);

      // Find corresponding emotion analysis for this section
      const emotion = emotions.find(e => e.sectionIndex === i);
      
      // Insert GIF reactions at optimal points based on emotional analysis
      if (emotion && shouldInsertGifReaction(emotion, i, sections.length)) {
        try {
          const gifResult = await giphyService.searchReactionGif({
            searchTerms: emotion.giffSearchTerms,
            emotion: emotion.emotion,
            intensity: emotion.intensity,
            safeSearch: true
          });

          if (gifResult) {
            const gifSection = {
              type: 'gif-reaction',
              content: getGifCaption(emotion),
              metadata: {
                id: `emotion-gif-${i}`,
                url: gifResult.url,
                title: gifResult.title,
                caption: getGifCaption(emotion),
                width: gifResult.width,
                height: gifResult.height,
                preview: gifResult.preview,
                emotion: emotion.emotion,
                intensity: emotion.intensity
              }
            };

            enhancedSections.push(gifSection);
          }
        } catch (error) {
          console.warn('Failed to fetch GIF for emotion:', error);
        }
      }
    }

    return enhancedSections;
  }, []); // Removed giphyService dependency - it's a static import

  // Function to determine what content to insert between paragraphs
  const getInsertionContent = (paragraphIndex: number, emotion?: EmotionalAnalysis) => {
    const insertionType = paragraphIndex % 12; // Cycle through different types
    
    // Sample pull quotes from the post
    const pullQuotes = [
      "The audacity of some people never ceases to amaze me.",
      "This is exactly why we can't have nice things.",
      "Sometimes the real treasure is the drama we made along the way.",
      "The internet remains undefeated in its ability to surprise.",
    ];

    // Sample tweet comments
    const tweetComments = [
      { user: "@RealityCheck", content: "This is peak internet behavior honestly", likes: 847, retweets: 203 },
      { user: "@DramaDetector", content: "The plot thickens... and I'm here for it", likes: 1240, retweets: 567 },
      { user: "@ChaosCoordinator", content: "Well that escalated quickly 📈", likes: 932, retweets: 388 },
      { user: "@ModernProblems", content: "This is why I love the internet tbh", likes: 1580, retweets: 629 },
    ];

    if (insertionType < 4) {
      // Pull quote
      return (
        <blockquote className="border-l-4 border-orange-500 pl-6 py-4 my-6 bg-muted/30 rounded-r-lg">
          <p className="text-xl font-medium text-foreground italic leading-relaxed">
            {pullQuotes[paragraphIndex % pullQuotes.length]}
          </p>
        </blockquote>
      );
    } else if (insertionType < 8) {
      // Tweet comment
      const tweet = tweetComments[paragraphIndex % tweetComments.length];
      return (
        <div className="jaunty-cutout bg-card border border-border rounded-lg p-6 mx-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {tweet.user.charAt(1).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-foreground">{tweet.user}</span>
                <span className="text-muted-foreground text-sm">• 2h</span>
              </div>
              <p className="text-foreground mb-3">{tweet.content}</p>
              <div className="flex items-center gap-6 text-muted-foreground text-sm">
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {Math.floor(tweet.likes / 10)}
                </span>
                <span className="flex items-center gap-1">
                  <ArrowUp className="h-4 w-4" />
                  {tweet.likes.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Share2 className="h-4 w-4" />
                  {tweet.retweets}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Try to insert a GIF if we have emotion analysis
      if (emotion && emotion.giffSearchTerms && emotion.giffSearchTerms.length > 0) {
        // This would be populated by the existing GIF enhancement logic
        // For now, return a placeholder or nothing since GIFs are handled elsewhere
        return null;
      }
      return null;
    }
  };

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/posts/${postId}?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        if (!response.ok) {
          throw new Error('Post not found');
        }
        const postData = await response.json();
        setPost(postData);

        // Analyze content quality and adapt sections
        // Analyzing post data
        
        
        if (postData.content?.sections) {
          try {
            const quality = contentQualityChecker.analyzeContent({
            title: postData.title,
            content: postData.content.sections.map((s: any) => s.content).join('\n\n'),
            sections: postData.content.sections,
            socialMetrics: {
              viewCount: postData.viewCount,
              upvoteCount: postData.upvoteCount,
              commentCount: postData.commentCount,
              shareCount: postData.shareCount,
              bookmarkCount: postData.bookmarkCount,
            },
            source: 'twitter_drama',
            category: postData.category
          });

          setContentQuality(quality);
          
          // Content quality analyzed
          
          
          // Adapt sections based on quality
          const adaptedSections = adaptSectionsForQuality(postData.content.sections, quality);
          setAdaptiveSections(adaptedSections);

          // Analyze emotions and enhance story with GIF reactions
          const emotions = await analyzeEmotionsForSections(postData.content.sections, {
            category: postData.category,
            contentQuality: quality.qualityTier
          });
          setEmotionalAnalysis(emotions);
          
          // Emotion analysis completed

          // Enhance story with GIF reactions for all published content
          if (quality.passesPublishingThreshold) {
            // Enhancing story with GIFs
            const enhancedSections = await enhanceStoryWithGifs(adaptedSections, emotions);
            setAdaptiveSections(enhancedSections);
          } else {
            // Story quality too low for GIF enhancement
          }

          // Extract metaphor for all published content (70%+ quality)
          if (quality.passesPublishingThreshold) {
            // Generating Terry's metaphor for quality content
            const insight = metaphorExtractor.extractMetaphor(
              postData.title,
              postData.content.sections.map((s: any) => s.content).join('\n\n'),
              postData.category,
              emotions[0]?.emotion || 'pure_entertainment'
            );
            setMetaphorInsight(insight);
            
            // Show Terry's bubble after a delay for quality content
            setTimeout(() => {
              setShowTerrysBubble(true);
            }, 8000);
          } else {
            // Story quality too low for Terry's corner
          }
          } catch (qualityError) {
            // Error in quality analysis
          }
        }

        // Fetch related stories based on category and tags
        // Fetching related stories
        await fetchRelatedStories(postData.category, postData.tags || [], postData.id);
      } catch (err) {
        console.error('Error fetching post:', err);
      } finally {
        setIsLoading(false);
      }
    }

    async function fetchRelatedStories(category: string, tags: string[], currentPostId: string) {
      try {
        const response = await fetch(`/api/posts?t=${Date.now()}`, {
          cache: 'no-store'
        });
        if (response.ok) {
          const allPosts = await response.json();

          // Filter posts that share category or tags with current post
          const related = allPosts.posts
            .filter((p: any) => p.id !== currentPostId) // Exclude current post
            .filter(
              (p: any) =>
                // Same category
                p.category === category ||
                // Or share at least one tag
                (p.tags && tags.length > 0 && p.tags.some((tag: string) => tags.includes(tag)))
            )
            .sort((a: any, b: any) => {
              // Prioritize same category
              const aSameCategory = a.category === category ? 1 : 0;
              const bSameCategory = b.category === category ? 1 : 0;
              if (aSameCategory !== bSameCategory) return bSameCategory - aSameCategory;
              
              // Then sort by number of shared tags
              const aSharedTags = tags.length > 0 && a.tags ? 
                a.tags.filter((tag: string) => tags.includes(tag)).length : 0;
              const bSharedTags = tags.length > 0 && b.tags ? 
                b.tags.filter((tag: string) => tags.includes(tag)).length : 0;
              if (aSharedTags !== bSharedTags) return bSharedTags - aSharedTags;
              
              // Finally by trending score
              return (b.trending_score || b.viral_score || 0) - (a.trending_score || a.viral_score || 0);
            })
            .slice(0, 3); // Take top 3

          // Found related stories
          
          // If we didn't find enough related stories, get some popular ones
          if (related.length < 3) {
            const popular = allPosts.posts
              .filter((p: any) => p.id !== currentPostId && !related.find((r: any) => r.id === p.id))
              .sort((a: any, b: any) => (b.trending_score || b.viral_score || 0) - (a.trending_score || a.viral_score || 0))
              .slice(0, 3 - related.length);
            
            related.push(...popular);
            // Added popular stories to fill
          }
          
          setRelatedStories(related);
        }
      } catch (err) {
        console.error('Error fetching related stories:', err);
      }
    }

    fetchPost();
  }, [postId, enhanceStoryWithGifs]);

  // Adaptive section function
  const adaptSectionsForQuality = (sections: any[], quality: ContentQualityMetrics): any[] => {
    if (!sections) return [];

    switch (quality.qualityTier) {
      case 'premium':
        // Premium content gets full sections with enhanced details
        return sections.map((section, index) => {
          if (section.type === 'describe-1' || section.type === 'describe-2') {
            // Expand description sections with more depth
            return {
              ...section,
              enhanced: true,
              readingComplexity: 'detailed'
            };
          }
          return section;
        });

      case 'standard':
        // Standard content gets good length with some condensation
        return sections.filter((section, index) => {
          // Keep core sections but maybe trim some repetitive content
          return section.type !== 'redundant-content';
        });

      case 'basic':
        // Basic content gets condensed to essential sections
        const essentialTypes = ['describe-1', 'quotes', 'discussion', 'outro'];
        return sections.filter(section => 
          essentialTypes.includes(section.type) || 
          section.type.includes('twitter') || 
          section.type.includes('comments')
        ).slice(0, 6); // Limit to 6 sections max

      default:
        return sections;
    }
  };

  // Calculate dynamic reading time based on content quality and sections
  const calculateDynamicReadingTime = (sections: any[], quality: ContentQualityMetrics | null): number => {
    if (!sections || !quality) return post?.readingTime || 5;

    const baseWordsPerMinute = 200;
    let totalWords = 0;

    sections.forEach(section => {
      if (section.content) {
        const words = section.content.split(/\s+/).length;
        
        // Adjust reading time based on section complexity
        if (section.enhanced || quality.qualityTier === 'premium') {
          totalWords += words * 1.2; // Premium content takes 20% longer to read
        } else if (section.type === 'twitter-conversation' || section.type === 'comments-1') {
          totalWords += words * 0.8; // Social content reads faster
        } else {
          totalWords += words;
        }
      }
    });

    // Quality adjustment factor
    const qualityMultiplier = quality.qualityTier === 'premium' ? 1.15 : 
                             quality.qualityTier === 'standard' ? 1.0 : 0.85;

    const readingTime = Math.ceil((totalWords / baseWordsPerMinute) * qualityMultiplier);
    return Math.max(readingTime, 2); // Minimum 2 minutes
  };

  // Analyze emotions for story sections
  const analyzeEmotionsForSections = async (
    sections: any[], 
    context: { category: string; contentQuality: string }
  ): Promise<EmotionalAnalysis[]> => {
    const emotions: EmotionalAnalysis[] = [];
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      
      // Only analyze content sections (include quotes for emotional analysis)
      if (section.content && section.type && 
          ['describe-1', 'describe-2', 'quotes', 'discussion', 'outro'].includes(section.type)) {
        
        const analysis = sentimentAnalyzer.analyzeSection(section.content, {
          category: context.category,
          sectionType: section.type,
          sectionIndex: i,
          totalSections: sections.length,
          contentQuality: context.contentQuality as any
        });
        
        emotions.push({
          ...analysis,
          sectionIndex: i,
          sectionType: section.type
        });
      }
    }
    
    return emotions;
  };


  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const renderMediaEmbed = (section: any, index: number) => {
    const media = section.metadata?.media;
    if (!media) return null;

    switch (media.type) {
      case 'youtube':
      case 'video':
        return (
          <div key={index} className="media-embed-section my-12">
            <YouTubeEmbed
              videoId={media.embedId}
              embedUrl={media.embedUrl}
              title={media.title}
              thumbnailUrl={media.thumbnailUrl}
              className="w-full"
            />
            {media.title && (
              <div className="mt-4">
                <h4 className="text-lg font-semibold text-foreground">{media.title}</h4>
                {media.author && (
                  <p className="text-sm text-muted-foreground">by {media.author}</p>
                )}
                {media.confidence < 0.8 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="italic">Related video - exact match unavailable</span>
                  </p>
                )}
              </div>
            )}
          </div>
        );
      
      case 'tweet':
        return (
          <div key={index} className="media-embed-section my-12">
            <TwitterEmbed
              tweetId={media.embedId}
              embedUrl={media.embedUrl}
              embedHtml={media.embedHtml}
              className="w-full max-w-2xl mx-auto"
            />
            {media.confidence < 0.8 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                <span className="italic">Related tweet - exact match unavailable</span>
              </p>
            )}
          </div>
        );
      
      case 'tiktok':
        return (
          <div key={index} className="media-embed-section my-12">
            <TikTokEmbed
              videoId={media.embedId}
              embedUrl={media.embedUrl}
              embedHtml={media.embedHtml}
              className="w-full max-w-md mx-auto"
            />
            {media.confidence < 0.8 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                <span className="italic">Related TikTok - exact match unavailable</span>
              </p>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderSection = (section: any, index: number) => {
    // Check additional section types first
    const additionalSection = renderAdditionalSections(section, index, post);
    if (additionalSection) return additionalSection;
    
    switch (section.type) {
      case 'media_embed':
        return renderMediaEmbed(section, index);
      
      case 'image':
        return (
          <div key={index} className='image-section my-12'>
            <div className='overflow-hidden rounded-lg border border-border'>
              <Image
                src={section.metadata?.imageUrl || `/assets/img/lifestyle/life_style0${(index % 9) + 1}.jpg`}
                alt={section.content}
                width={800}
                height={400}
                className='h-auto w-full object-cover'
                style={{ maxHeight: '400px' }}
              />
              {section.metadata?.caption && (
                <div className='bg-muted/50 p-4'>
                  <p className='text-sm font-medium text-foreground'>
                    {section.metadata.caption}
                  </p>
                </div>
              )}
            </div>
            <p className='mt-2 text-sm italic text-muted-foreground text-center'>
              {section.content}
            </p>
          </div>
        );

      case 'hero_image':
        return (
          <div key={index} className='hero-image-section mb-8'>
            <Image
              src={section.metadata?.imageUrl || `/assets/img/blog/blog${Math.floor(Math.random() * 15) + 1}.jpg`}
              alt={section.content || post.title}
              width={800}
              height={400}
              className='mb-3 h-[400px] w-full rounded-lg object-cover'
            />
            {section.content && (
              <p className='text-center text-sm italic text-muted-foreground'>
                {section.content}
              </p>
            )}
          </div>
        );

      case 'embedded_image':
        return (
          <div key={index} className='embedded-image-section my-12'>
            {section.title && (
              <h4 className='mb-3 text-xl font-bold text-foreground'>
                {section.title}
              </h4>
            )}
            <div className='overflow-hidden rounded-lg border border-border bg-card'>
              {section.metadata?.imageUrl ? (
                <Image
                  src={section.metadata.imageUrl}
                  alt={section.content}
                  width={800}
                  height={400}
                  className='w-full object-cover'
                  style={{ maxHeight: '400px' }}
                />
              ) : (
                <div className='h-64 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center'>
                  <span className='text-orange-600 text-lg font-semibold'>📸 Image Evidence</span>
                </div>
              )}
              <div className='bg-orange-500/10 p-4'>
                <p className='text-sm font-medium text-muted-foreground'>
                  {section.content}
                </p>
              </div>
              {section.metadata?.caption && (
                <div className='border-t border-border bg-background p-4'>
                  <p className='text-base font-semibold text-foreground'>
                    {section.metadata.caption}
                  </p>
                  {section.metadata.imageType && (
                    <span className='mt-2 inline-block rounded-full bg-orange-500/20 px-3 py-1 text-xs font-medium text-orange-600'>
                      {section.metadata.imageType.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 'describe-1':
      case 'describe-2':
      case 'describe-3':
      case 'describe-4':
      case 'describe':
        return (
          <div key={index} className={`description-section mb-8 ${section.enhanced ? 'enhanced-content' : ''}`}>
            {section.title && (
              <h3 className={`mb-4 font-extrabold text-foreground ${
                section.enhanced ? 'text-3xl' : 'text-2xl'
              }`}>
                {section.title}
                {section.enhanced && (
                  <span className='ml-2 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800'>
                    PREMIUM
                  </span>
                )}
              </h3>
            )}
            <div className={`prose max-w-none ${
              section.enhanced ? 'prose-xl' : 'prose-lg'
            }`}>
              {section.content
                .split(/\n\n/)
                .map((paragraph: string, pIndex: number) => {
                  const elements = [
                    <p
                      key={`p-${pIndex}`}
                      className={`mb-4 text-lg font-medium leading-relaxed text-foreground ${
                        section.enhanced ? 'text-xl' : 'text-lg'
                      }`}
                    >
                      {renderContentWithAutoLinks(paragraph, post)}
                    </p>
                  ];

                  // Insert content between every 4 paragraphs
                  if ((pIndex + 1) % 4 === 0 && pIndex < section.content.split(/\n\n/).length - 1) {
                    // Find corresponding emotion analysis for this section if available
                    const sectionEmotion = emotionalAnalysis.find(e => e.sectionIndex === index);
                    
                    // Insert pull quote, tweet, or GIF
                    const insertionContent = getInsertionContent(pIndex, sectionEmotion);
                    if (insertionContent) {
                      elements.push(
                        <div key={`insertion-${pIndex}`} className="my-8">
                          {insertionContent}
                        </div>
                      );
                    }
                  }

                  return elements;
                })}
            </div>
          </div>
        );

      case 'comments':
      case 'comments-1':
      case 'comments-2':
        return (
          <div key={index} className='comments-section mb-8'>
            {section.title && (
              <h3 className='mb-6 flex items-center gap-3 text-2xl font-extrabold text-foreground'>
                <MessageCircle className='h-8 w-8 text-orange-500' />
                {section.title}
              </h3>
            )}
            <p className='mb-6 text-lg font-medium leading-relaxed text-foreground'>
              {section.content}
            </p>
            {section.metadata?.comments && (
              section.metadata.platform === 'twitter' ? (
                <TwitterConversation
                  title="The Twitter Thread"
                  conversation={section.metadata.comments.map((comment: any, index: number) => ({
                    id: `comment-${index}`,
                    author: comment.author,
                    handle: comment.author.toLowerCase().replace(/\s+/g, ''),
                    content: comment.content,
                    timestamp: '2h',
                    likes: comment.likes || comment.score || 0,
                    retweets: comment.retweets || Math.floor((comment.score || 0) * 0.3),
                    replies: comment.replies || 0,
                    verified: false,
                    isOP: index === 0
                  }))}
                  className="max-w-none"
                />
              ) : (
                <div className="reddit-comments space-y-4">
                  {section.metadata.comments.map((comment: any, index: number) => (
                    <div key={index} className="bg-muted/50 rounded-lg p-4 border-l-4 border-orange-500">
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <button className="text-muted-foreground hover:text-orange-500 transition-colors">
                            <ChevronUp className="h-5 w-5" />
                          </button>
                          <span className="text-sm font-bold text-orange-500">
                            {comment.upvotes || comment.score || Math.floor(Math.random() * 5000) + 100}
                          </span>
                          <button className="text-muted-foreground hover:text-blue-500 transition-colors">
                            <ChevronDown className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-sm text-foreground">
                              {comment.author}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              • {Math.floor(Math.random() * 12) + 1}h ago
                            </span>
                          </div>
                          <p className="text-foreground">{comment.content}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <button className="text-sm text-muted-foreground hover:text-foreground">
                              Reply
                            </button>
                            <button className="text-sm text-muted-foreground hover:text-foreground">
                              Share
                            </button>
                            <button className="text-sm text-muted-foreground hover:text-foreground">
                              Award
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        );

      case 'discussion':
        return (
          <div key={index} className='discussion-section mb-8'>
            {section.title && (
              <h3 className='mb-4 text-2xl font-extrabold text-foreground'>
                {section.title}
              </h3>
            )}
            <div className='prose prose-lg max-w-none'>
              {section.content
                .split(/\n\n/)
                .map((paragraph: string, pIndex: number) => (
                  <p
                    key={pIndex}
                    className='mb-4 text-lg font-medium leading-relaxed text-foreground'
                  >
                    {renderContentWithLinks(paragraph)}
                  </p>
                ))}
            </div>
          </div>
        );

      case 'outro':
        return (
          <div key={index} className='outro-section mb-8'>
            {section.title && (
              <h3 className='mb-4 text-2xl font-extrabold text-foreground'>
                {section.title}
              </h3>
            )}
            <div className='prose prose-lg max-w-none'>
              {section.content
                .split(/\n\n/)
                .map((paragraph: string, pIndex: number) => (
                  <p
                    key={pIndex}
                    className='mb-4 text-lg font-medium leading-relaxed text-foreground'
                  >
                    {renderContentWithLinks(paragraph)}
                  </p>
                ))}
            </div>
          </div>
        );

      case 'quotes':
        return (
          <div key={index} className='quotes-section mb-8'>
            <div className='py-8'>
              <blockquote className='text-3xl font-extrabold leading-tight text-foreground md:text-4xl lg:text-5xl'>
                {section.content}
              </blockquote>
              {section.metadata?.attribution && (
                <cite className='mt-4 block text-xl font-semibold text-orange-500'>
                  — {section.metadata.userUrl ? (
                    <HoverLink
                      href={section.metadata.userUrl}
                      external={true}
                      className="text-orange-500 hover:text-orange-600 underline"
                    >
                      {section.metadata.attribution}
                    </HoverLink>
                  ) : (
                    section.metadata.attribution
                  )}
                </cite>
              )}
              {section.metadata?.context && (
                <p className='mt-2 text-base italic text-muted-foreground'>
                  {section.metadata.context}
                </p>
              )}
            </div>
          </div>
        );

      case 'twitter-quote':
        return (
          <TwitterQuote
            key={index}
            content={section.content}
            author={section.metadata?.author || 'Unknown User'}
            handle={section.metadata?.handle || 'unknown'}
            timestamp={section.metadata?.timestamp || '2h'}
            retweets={section.metadata?.retweets || 0}
            likes={section.metadata?.likes || 0}
            replies={section.metadata?.replies || 0}
            context={section.metadata?.context}
            verified={section.metadata?.verified || false}
          />
        );

      case 'twitter-conversation':
        return (
          <div key={index} className='twitter-conversation-section mb-8'>
            {section.title && (
              <h3 className='mb-4 text-2xl font-extrabold text-foreground'>
                {section.title}
              </h3>
            )}
            {section.content && (
              <p className='mb-6 text-lg font-medium leading-relaxed text-foreground'>
                {renderContentWithLinks(section.content)}
              </p>
            )}
            {section.metadata?.conversation && (
              <TwitterConversation
                title={section.title || "Twitter Conversation"}
                conversation={section.metadata.conversation}
                className="max-w-none"
              />
            )}
          </div>
        );

      case 'gif-reaction':
        return (
          <GifReaction
            key={index}
            id={section.metadata?.id || `gif-${index}`}
            url={section.metadata?.url || ''}
            title={section.metadata?.title || 'Reaction GIF'}
            caption={section.metadata?.caption || section.content}
            width={section.metadata?.width}
            height={section.metadata?.height}
            preview={section.metadata?.preview}
            className="my-8"
          />
        );

      case 'terry_corner':
        return (
          <div key={index} className='terry-corner-section my-12 rounded-lg border-2 border-orange-500 bg-orange-500/10 p-6'>
            <div className='mb-4 flex items-center gap-3'>
              <Image
                src={section.metadata?.imageUrl || '/assets/img/personas/the-terry.svg'}
                alt="The Terry"
                width={48}
                height={48}
                className='h-12 w-12 rounded-full'
              />
              <h3 className='text-xl font-extrabold text-foreground'>
                Terry&apos;s Corner
              </h3>
            </div>
            <p className='text-lg font-medium italic leading-relaxed text-foreground'>
              {section.content}
            </p>
          </div>
        );

      case 'video_embed':
        return (
          <div key={index} className='video-embed-section my-12'>
            {section.title && (
              <h3 className='mb-4 text-2xl font-extrabold text-foreground'>
                {section.title}
              </h3>
            )}
            <div className='overflow-hidden rounded-lg border border-border bg-card'>
              <div className='relative aspect-video bg-black'>
                {section.metadata?.thumbnail ? (
                  <Image
                    src={section.metadata.thumbnail}
                    alt={section.title || 'Video thumbnail'}
                    width={800}
                    height={450}
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <div className='h-full w-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center'>
                    <span className='text-white text-lg'>📹 Video Content</span>
                  </div>
                )}
                <div className='absolute inset-0 flex items-center justify-center bg-black/40'>
                  <div className='rounded-full bg-white/90 p-4'>
                    <svg className='h-12 w-12 text-orange-500' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M8 5v14l11-7z' />
                    </svg>
                  </div>
                </div>
                {section.metadata?.duration && (
                  <div className='absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs text-white'>
                    {section.metadata.duration}
                  </div>
                )}
              </div>
              <div className='p-4'>
                <div className='mb-2 flex items-center justify-between text-sm text-muted-foreground'>
                  {section.metadata?.platform && (
                    <span className='font-medium'>{section.metadata.platform}</span>
                  )}
                  {section.metadata?.views && (
                    <span>{section.metadata.views}</span>
                  )}
                </div>
                <p className='text-base text-foreground'>{section.content}</p>
                {section.metadata?.transcript && (
                  <div className='mt-4 rounded-lg bg-muted/50 p-4'>
                    <p className='mb-2 text-sm font-semibold text-foreground'>Transcript:</p>
                    <p className='text-sm italic text-muted-foreground'>
                      &quot;{section.metadata.transcript}&quot;
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'twitter_thread':
        return (
          <div key={index} className='twitter-thread-section my-12'>
            {section.title && (
              <h3 className='mb-4 text-2xl font-extrabold text-foreground'>
                {section.title}
              </h3>
            )}
            {section.content && (
              <p className='mb-6 text-lg text-foreground'>{section.content}</p>
            )}
            {section.metadata?.tweets && (
              <div className='space-y-3'>
                {section.metadata.tweets.map((tweet: any, i: number) => (
                  <div key={i} className='rounded-lg border border-border bg-card p-4'>
                    <div className='mb-2 flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <div className='h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600'></div>
                        <div>
                          <div className='flex items-center gap-1'>
                            <span className='font-semibold'>{tweet.author}</span>
                            {tweet.verified && (
                              <CheckCircle className='h-4 w-4 text-blue-500' />
                            )}
                          </div>
                          <span className='text-sm text-muted-foreground'>{tweet.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    <p className='mb-3 text-base'>{tweet.content}</p>
                    {tweet.metrics && (
                      <div className='flex gap-4 text-sm text-muted-foreground'>
                        <span>{tweet.metrics.retweets} Retweets</span>
                        <span>{tweet.metrics.quotes} Quotes</span>
                        <span>{tweet.metrics.likes} Likes</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'text':
        // Handle TikTok links and other plain text sections
        if (section.metadata?.isTikTokLink) {
          // Parse markdown link
          const linkMatch = section.content.match(/\[([^\]]+)\]\(([^)]+)\)/);
          if (linkMatch) {
            const [, linkText, linkUrl] = linkMatch;
            return (
              <div key={index} className='tiktok-link-section my-8 text-center'>
                <div className='inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold'>
                  <Play className='h-5 w-5' />
                  <a 
                    href={linkUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className='hover:underline'
                  >
                    {linkText}
                  </a>
                  <ExternalLink className='h-4 w-4' />
                </div>
              </div>
            );
          }
        }
        
        // Regular text section
        return (
          <div key={index} className='text-section mb-8'>
            <p className='text-lg font-medium leading-relaxed text-foreground'>
              {renderContentWithLinks(section.content)}
            </p>
          </div>
        );

      default:
        return (
          <div key={index} className='default-section mb-8'>
            <p className='text-lg text-foreground'>{section.content}</p>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-background'>
        <div className='container mx-auto px-4 py-8'>
          <div className='mx-auto max-w-4xl'>
            <div className='animate-pulse space-y-4'>
              <div className='h-8 w-3/4 rounded bg-gray-200'></div>
              <div className='h-4 w-1/2 rounded bg-gray-200'></div>
              <div className='h-64 rounded bg-gray-200'></div>
              <div className='space-y-2'>
                <div className='h-4 rounded bg-gray-200'></div>
                <div className='h-4 w-5/6 rounded bg-gray-200'></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-background'>
        <div className='text-center'>
          <h1 className='mb-4 text-2xl font-bold'>Post not found</h1>
          <Link href='/' className='text-orange-500 hover:text-orange-600'>
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>

      {/* Main Content */}
      <main className='container mx-auto px-4 py-8'>
        <div className='grid gap-8 lg:grid-cols-4'>
          {/* Article Content */}
          <div className='lg:col-span-3'>
            <article className='max-w-none'>
              {/* Post Header */}
              <header className='mb-8'>
                {/* Featured Image */}
                {post.imageUrl && (
                  <div className='mb-8 overflow-hidden rounded-xl'>
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      width={800}
                      height={400}
                      className='h-[400px] w-full object-cover'
                      priority
                      sizes='(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 800px'
                    />
                  </div>
                )}
                
                <h1 className='mb-4 text-4xl font-extrabold leading-tight text-foreground md:text-5xl'>
                  {post.title}
                </h1>
                <p className='mb-6 text-xl text-muted-foreground'>
                  {post.excerpt}
                </p>


                <div className='mb-6 flex items-center justify-between'>
                  <div className='flex items-center space-x-4'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 font-bold text-white'>
                      {post.persona?.name?.charAt(0) || 'T'}
                    </div>
                    <div>
                      <div className='font-bold text-foreground'>
                        {post.persona?.name || post.author}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        {new Date(post.createdAt).toLocaleDateString()} •{' '}
                        {contentQuality ? 
                          calculateDynamicReadingTime(adaptiveSections.length > 0 ? adaptiveSections : post.content?.sections || [], contentQuality) 
                          : post.readingTime
                        } min read
                        {contentQuality?.qualityTier === 'premium' && (
                          <span className='ml-1 text-green-600'>• Extended</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center space-x-4 text-sm text-muted-foreground'>
                    <span className='flex items-center'>
                      <Eye className='mr-1 h-4 w-4' />
                      {post.viewCount?.toLocaleString()}
                    </span>
                    <span className='flex items-center'>
                      <MessageCircle className='mr-1 h-4 w-4' />
                      {post.commentCount?.toLocaleString()}
                    </span>
                    <span className='flex items-center'>
                      <Share2 className='mr-1 h-4 w-4' />
                      {post.shareCount?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </header>

              {/* Reddit Source Attribution */}
              {post.redditSource && (
                <div className='reddit-source-banner mb-8 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 p-6 text-white'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                      <div className='rounded-full bg-white/20 p-3'>
                        <Image
                          src='/assets/img/reddit-icon.svg'
                          alt='Reddit'
                          width={24}
                          height={24}
                          className='h-6 w-6'
                        />
                      </div>
                      <div>
                        <h3 className='mb-1 text-xl font-extrabold'>
                          Originally from Reddit
                        </h3>
                        <p className='text-white/80'>
                          r/{post.redditSource.subreddit} •{' '}
                          {post.redditSource.originalPost}
                        </p>
                      </div>
                    </div>
                    <a
                      href={post.redditSource.threadUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-2 rounded-lg bg-white/20 px-6 py-3 font-semibold transition-colors hover:bg-white/30'
                    >
                      <ExternalLink className='h-5 w-5' />
                      View Original Thread
                    </a>
                  </div>
                </div>
              )}

              {/* Share Action */}
              <div className='mb-8 rounded-lg bg-muted/30 p-4'>
                <div className='flex items-center gap-6'>
                  <button
                    onClick={handleShare}
                    className='group flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-green-500/10'
                  >
                    <Share2 className='h-5 w-5 text-muted-foreground group-hover:text-green-500' />
                    <span className='font-mono text-sm text-muted-foreground group-hover:text-green-500'>
                      Share
                    </span>
                  </button>
                </div>
              </div>


              {/* Story Content - Direct from Database */}
              <div className='story-content space-y-8'>
                {/* Rendering sections */}
                {(post.content?.sections || []).map((section: any, index: number) => (
                  <React.Fragment key={index}>
                    {/* Section rendering */}
                    {renderSection(section, index)}

                    {/* Insert inline ad after 2nd section (after intro) */}
                    {index === 1 && (
                      <InlineAd variant='responsive' spacing='normal' />
                    )}

                    {/* Insert another ad mid-content for longer premium content */}
                    {index ===
                      Math.floor((adaptiveSections.length || post.content?.sections?.length || 0) / 2) &&
                      index > 2 && contentQuality?.qualityTier === 'premium' && (
                        <InlineAd variant='rectangle' spacing='normal' />
                      )}
                  </React.Fragment>
                ))}
              </div>

              {/* Terry's Metaphor Corner - Always show for published content */}
              {metaphorInsight && contentQuality?.passesPublishingThreshold && (
                <div className="terry-corner mt-12 mb-8">
                  <div className="flex items-stretch gap-2 max-w-4xl mx-auto">
                    {/* Terry's icon - outside speech bubble */}
                    <div className="flex-shrink-0 animate-terry-float w-24">
                      <svg className="h-full w-full" viewBox="0 0 143.26 145.96" xmlns="http://www.w3.org/2000/svg">
                        <path className="cls-3" fill="#f44c23" d="M101.18,7.45c-2.54,1.54-7,3.82-8.51,6.27-2.18,3.55-2.01,9.66-2.79,13.78-.04.22-.08.34-.28.47-2.26-.97-4.73-1.05-7.16-.93-15.34.73-31.12,3.7-46.52,4.52-2.88.84-9.81-.11-10.74,3.57-.17.68-.25,2.64-.28,3.48-.32,7.31.15,14.75.2,22.04.12,15.28.3,30.52.57,45.77.05,2.98-.4,7.33.08,10.09.2,1.19.76,1.77,1.63,2.51,7.87,5.22,15.44,10.95,23.42,15.94,1.35.38,3.05-.2,4.44-.48,17.23-3.48,35.48-7.57,52.51-11.9,2.15-.55,5.38-.79,5.83-3.4.64-3.71.25-8.7.41-12.58.72-16.75,1.53-33.53,2.28-50.27.21-4.82.66-9.92.75-14.69.04-2.09.09-3.75-1.95-4.84l-13.58-5.03-.13-.3,1.81-10.07c3.48-1.99,6.98-3.98,10.51-5.89.25-.14.6-.09.69-.15,6.07,4.52,11.47,10.1,15.79,16.33,23.39,33.71,14.62,79.58-19.42,102.38-31.52,21.11-72.88,13.18-95.71-16.45C-10.05,85.08-2.96,37.86,30.48,14.27,47.7,2.12,68.83-1.47,89.31,3.4c4.06.97,8.03,2.42,11.86,4.05Z"/>
                        <path className="cls-1" fill="#0d0e0a" d="M114.36,15.36c-.1.05-.44,0-.69.15-3.53,1.91-7.03,3.9-10.51,5.89l-1.81,10.07.13.3,13.58,5.03c2.04,1.1,1.99,2.75,1.95,4.84-.09,4.77-.54,9.87-.75,14.69-.74,16.75-1.56,33.52-2.28,50.27-.17,3.88.22,8.87-.41,12.58-.45,2.61-3.68,2.86-5.83,3.4-17.03,4.33-35.28,8.43-52.51,11.9-1.39.28-3.09.86-4.44.48-7.98-5-15.55-10.73-23.42-15.94-.87-.75-1.43-1.32-1.63-2.51-.47-2.77-.03-7.12-.08-10.09-.26-15.25-.45-30.49-.57-45.77-.06-7.28-.53-14.73-.2-22.04.04-.84.11-2.8.28-3.48.94-3.68,7.86-2.73,10.74-3.57,15.4-.82,31.18-3.79,46.52-4.52,2.43-.11,4.9-.04,7.16.93.2-.13.23-.25.28-.47.79-4.12.61-10.23,2.79-13.78,1.51-2.45,5.98-4.74,8.51-6.27,4.05-2.46,8.26-4.71,12.3-7.19,4.87-1.91,10.14,7.02,7.44,11.02-.84,1.24-5.04,3.26-6.56,4.08Z"/>
                        <path className="cls-4" fill="#f7efde" d="M113.61,40.6l-3.29,77.8-57.17,12.99.66-83.44,59.8-7.34Z"/>
                        <path className="cls-2" fill="#f8f1e0" d="M103.25,10.28l6.22,3.77c-2.07,1.09-4.65,2.24-6.59,3.39l-6.03-3.2c1.98-1.59,4.21-2.64,6.4-3.96Z"/>
                        <path className="cls-1" fill="#0d0e0a" d="M78.2,83.74c7.43-4.5,19.96-5.13,23.36,4.61,1.07,3.06,1.24,8.26-1.51,10.46-.07.05-.12.14-.19.19-.27,0-.48.11-.57.38-4.46,1.91-6.92-2.09-11.4-2.45-7.87-.63-10.8,8.24-16.58,7.91-3.77-.21-4.27-4-3.61-7.01,1.17-5.39,5.83-11.27,10.49-14.09Z"/>
                        <path className="cls-1" fill="#0d0e0a" d="M70.1,66.78c-2.66-1.35-5.34-2.73-7.93-4.22-.52-1.33-.19-2.72,1.44-2.76.71-.02,3.44,1.63,4.35,2.05,4.4,2.07,8.81,4.12,13.21,6.2l.59.02c.46-.95-.22-2.37.91-2.96s1.99-.02,2.69.9c.03,1.31-.09,2.73-.72,3.89-.3.56-.77.84-.98,1.38-.46-.05-.81.31-1.24.37-1.16.16-4.3-1.11-5.49-1.65-.18-.08-.95-.66-1-.6,1.07,2.66,1.45,5.27.62,8.06-.25.82-.68,1.36-.99,2.11-.08.1-.24.23-.38.38l-.57.57c-.06.06-.13.13-.19.19-2.09,1.33-4.32,1.38-6.03-.57-.08-.12-.12-.26-.19-.38-.21-.38-.53-.69-.7-1.09-1.19-2.9-.81-7.01.89-9.64.06-.06.12-.13.19-.19.68-.64,1.47-1.42,2.45-1.51.13-.56-.5-.34-.94-.56Z"/>
                        <path className="cls-1" fill="#0d0e0a" d="M106.26,56.99c.05.05.13.13.19.19.58,1.53-.07,2.03-.94,3.01-.06.06-.13.13-.19.19l-2.64,2.07-.19.19-3.11,2.25c-.34.5.35.47.48.57.08.06.2.24.38.38,1.84,2.9,1.83,6.97-.19,9.79-.56.52-1.5,1.51-2.21,1.65-4.15.85-5.82-4.74-4.39-7.78-1.42.59-3.3,2.1-4.75.67-.92-.9-1.12-5.32-.03-6.02,1.97-1.25,2.52,1.41,2.62,2.81,3.48-2.77,7.01-5.47,10.45-8.29.6-.49,1.31-.92,1.88-1.51.06-.06.13-.12.19-.19.93-.56,1.5-.4,2.45,0Z"/>
                      </svg>
                    </div>
                    
                    {/* Speech bubble */}
                    <div className="relative bg-orange-500 rounded-2xl p-6 flex-1 animate-terry-jiggle ml-4">
                      {/* Speech bubble tail pointing left */}
                      <div className="absolute left-0 top-8 w-0 h-0 border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent border-r-[20px] border-r-orange-500 transform -translate-x-full"></div>
                      
                      {/* Terry's insight */}
                      <div>
                        <div 
                          className="text-sm font-medium text-white mb-1"
                          style={{ fontFamily: "'Bouchers Sans', sans-serif" }}
                        >
                          Terry&apos;s Take
                        </div>
                        <p 
                          className="text-black leading-relaxed"
                          style={{ fontFamily: "'Bouchers Sans', sans-serif" }}
                        >
                          {metaphorInsight.terryVoice}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Related Stories Section */}
              {showRelated && relatedStories.length > 0 && (
                <div className='related-stories-section mb-8 mt-8'>
                  <div className='rounded-lg border bg-card p-6'>
                    <h3 className='mb-6 flex items-center gap-2 text-xl font-extrabold text-foreground'>
                      <MessageCircle className='h-5 w-5 text-orange-500' />
                      Related Stories
                    </h3>

                    <div className='grid gap-4'>
                      {relatedStories.map((story, index) => (
                        <Link
                          key={story.id}
                          href={`/blog/${story.slug}`}
                          className='group'
                        >
                          <div className='rounded-lg border p-4 transition-all duration-200 hover:border-orange-500/30 hover:bg-accent'>
                            <div className='flex items-start gap-4'>
                              <div className='flex-1'>
                                <h4 className='mb-2 line-clamp-2 font-bold text-foreground transition-colors group-hover:text-orange-500'>
                                  {story.title}
                                </h4>

                                <p className='mb-3 line-clamp-2 text-sm text-muted-foreground'>
                                  {story.excerpt}
                                </p>

                                <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                                  <div className='flex items-center gap-1'>
                                    <User className='h-3 w-3' />
                                    <span>{story.author}</span>
                                  </div>

                                  {story.tags && story.tags.length > 0 && (
                                    <div className='flex items-center gap-1'>
                                      <span className='rounded-full bg-orange-500/10 px-2 py-1 text-xs font-medium text-orange-600'>
                                        {story.tags[0]}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className='flex items-center text-muted-foreground transition-colors group-hover:text-orange-500'>
                                <ExternalLink className='h-4 w-4' />
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* More Stories Like This Section */}
              {/* Rendering related stories */}
              {showRelated && relatedStories.length > 0 && (
                <div className='more-stories-section mt-16 pt-12 border-t border-border'>
                  <h2 className='mb-8 text-3xl font-extrabold text-foreground'>
                    More Stories Like This
                  </h2>
                  <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    {relatedStories.map((story) => (
                      <Link
                        key={story.id}
                        href={`/blog/${story.slug}`}
                        className='group block'
                      >
                        <article className='h-full rounded-lg border border-border bg-card overflow-hidden transition-all hover:shadow-lg hover:border-orange-500/50'>
                          {/* Featured Image */}
                          <div className='relative h-48 overflow-hidden bg-muted'>
                            {story.imageUrl ? (
                              <Image
                                src={story.imageUrl}
                                alt={story.title}
                                width={400}
                                height={192}
                                className='h-full w-full object-cover transition-transform group-hover:scale-105'
                              />
                            ) : (
                              <div className='flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200'>
                                <span className='text-4xl'>📰</span>
                              </div>
                            )}
                            {story.trending_score > 80 && (
                              <div className='absolute top-3 left-3 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white'>
                                🔥 TRENDING
                              </div>
                            )}
                          </div>

                          {/* Card Content */}
                          <div className='p-5'>
                            <h3 className='mb-3 text-lg font-bold text-foreground line-clamp-2 group-hover:text-orange-600 transition-colors'>
                              {story.title}
                            </h3>
                            <p className='mb-4 text-sm text-muted-foreground line-clamp-2'>
                              {story.hook || story.excerpt}
                            </p>

                            {/* Meta Info */}
                            <div className='flex items-center justify-between text-xs text-muted-foreground'>
                              <div className='flex items-center gap-3'>
                                <span className='flex items-center gap-1'>
                                  <Eye className='h-3 w-3' />
                                  {formatCount(story.view_count || 0)}
                                </span>
                                <span className='flex items-center gap-1'>
                                  <MessageCircle className='h-3 w-3' />
                                  {formatCount(story.comment_count || 0)}
                                </span>
                              </div>
                              <span className='text-orange-600 font-medium'>
                                Read More →
                              </span>
                            </div>
                          </div>
                        </article>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </article>
          </div>

          {/* Sidebar */}
          {showSidebar && (
            <div className='relative lg:col-span-1'>
              <div className='sticky top-20 space-y-6'>
                {/* Sidebar Ad */}
                <SidebarAd />
                
                <div className='rounded-lg border bg-card p-6'>
                  <h3 className='mb-4 text-lg font-extrabold text-foreground'>
                    Trending Now
                  </h3>
                  <div className='space-y-3'>
                    {[
                      'Boss made me work on birthday, deleted presentation',
                      "Sister's fake influencer lifestyle exposed",
                      "Roommate thinks she's a TikTok star",
                      'Coworker steals lunch, gets ghost pepper revenge',
                    ].map((title, index) => (
                      <div
                        key={index}
                        className='cursor-pointer rounded-lg p-3 transition-colors hover:bg-accent'
                      >
                        <p className='text-sm font-medium leading-tight text-foreground'>
                          {title}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='rounded-lg border bg-card p-6'>
                  <h3 className='mb-4 text-lg font-extrabold text-foreground'>
                    Related Stories
                  </h3>
                  <div className='space-y-3'>
                    <div className='cursor-pointer rounded-lg p-3 transition-colors hover:bg-accent'>
                      <p className='text-sm font-medium text-foreground'>
                        More workplace revenge stories
                      </p>
                      <p className='mt-1 text-xs text-muted-foreground'>
                        2.1k shares
                      </p>
                    </div>
                    <div className='cursor-pointer rounded-lg p-3 transition-colors hover:bg-accent'>
                      <p className='text-sm font-medium text-foreground'>
                        Family drama compilation
                      </p>
                      <p className='mt-1 text-xs text-muted-foreground'>
                        1.8k shares
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Terry's Animated Speech Bubble */}
      {showTerrysBubble && metaphorInsight && (
        <AnimatedSpeechBubble
          message={metaphorInsight.terryVoice}
          autoShow={true}
          showDelay={0}
          autoHide={false}
          onDismiss={() => setShowTerrysBubble(false)}
          position="right"
        />
      )}
    </div>
  );
}

