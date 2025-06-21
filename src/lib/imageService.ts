import { z } from 'zod'
import { intelligentImageRouter } from './intelligentImageRouter'

// Wikimedia Commons API response schemas
const WikimediaImageSchema = z.object({
  title: z.string(),
  url: z.string(),
  descriptionurl: z.string(),
  user: z.string(),
  timestamp: z.string(),
})

const UnsplashImageSchema = z.object({
  id: z.string(),
  urls: z.object({
    regular: z.string(),
    small: z.string(),
    thumb: z.string(),
  }),
  alt_description: z.string().nullable(),
  user: z.object({
    name: z.string(),
    username: z.string(),
  }),
  links: z.object({
    html: z.string(),
  }),
})

export interface ImageResult {
  url: string
  alt_text: string
  author: string
  source_name: string
  source_url: string
  license_type: string
  width?: number
  height?: number
}

export class ImageService {
  private unsplashAccessKey?: string
  private pexelsApiKey?: string
  private readonly fallbackImages: Record<string, string[]> = {
    'aita': [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1494790108755-2616c6d77eed?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop',
    ],
    'revenge': [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&h=300&fit=crop',
    ],
    'relationships': [
      'https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
    ],
    'work-stories': [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
    ],
    'funny': [
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop',
    ],
    default: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
    ]
  }

  constructor() {
    // Import env dynamically to avoid circular dependency
    const { env } = require('./env');
    
    this.unsplashAccessKey = env.UNSPLASH_ACCESS_KEY
    this.pexelsApiKey = env.PEXELS_API_KEY
  }

  /**
   * Search for entity-specific images on Wikipedia
   */
  async searchWikipediaEntityImages(wikipediaTitle: string): Promise<ImageResult[]> {
    try {
      // First, get the main page image from Wikipedia
      const pageInfoUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(wikipediaTitle)}&prop=pageimages&pithumbsize=400&pilicense=free`
      
      const pageResponse = await fetch(pageInfoUrl, {
        headers: {
          'User-Agent': 'ThreadJuice/1.0 (https://threadjuice.com; contact@threadjuice.com)',
        },
      })

      if (pageResponse.ok) {
        const pageData = await pageResponse.json()
        const pages = pageData.query?.pages
        
        if (pages) {
          for (const page of Object.values(pages) as any[]) {
            if (page.thumbnail?.source) {
              return [{
                url: page.thumbnail.source,
                alt_text: `${wikipediaTitle} - Wikipedia`,
                author: 'Wikipedia Contributors',
                source_name: 'Wikipedia',
                source_url: `https://en.wikipedia.org/wiki/${encodeURIComponent(wikipediaTitle)}`,
                license_type: 'Wikipedia License',
                width: page.thumbnail.width,
                height: page.thumbnail.height,
              }]
            }
          }
        }
      }

      // Fallback to Wikimedia Commons search with entity name
      return await this.searchWikimediaImages([wikipediaTitle.replace(/_/g, ' ')])
    } catch (error) {
      console.error('Wikipedia entity image search failed:', error)
      return []
    }
  }

  /**
   * Search for images on Wikimedia Commons
   */
  async searchWikimediaImages(keywords: string[]): Promise<ImageResult[]> {
    const searchQuery = keywords.join(' ')
    
    try {
      // Search for images on Wikimedia Commons
      const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=10&gsrsearch=${encodeURIComponent(searchQuery + ' filetype:bitmap')}&prop=imageinfo&iiprop=url|user|timestamp&iiurlwidth=400`
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'ThreadJuice/1.0 (https://threadjuice.com; contact@threadjuice.com)',
        },
      })

      if (!response.ok) {
        throw new Error(`Wikimedia API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.query?.pages) {
        return []
      }

      const images: ImageResult[] = []
      
      for (const page of Object.values(data.query.pages) as any[]) {
        if (page.imageinfo?.[0]) {
          const info = page.imageinfo[0]
          images.push({
            url: info.thumburl || info.url,
            alt_text: page.title.replace('File:', '').replace(/\.(jpg|jpeg|png|gif)$/i, ''),
            author: info.user || 'Unknown',
            source_name: 'Wikimedia Commons',
            source_url: `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
            license_type: 'CC BY-SA 4.0',
            width: info.thumbwidth || 400,
            height: info.thumbheight || 300,
          })
        }
      }

      return images.slice(0, 5) // Return top 5 results
    } catch (error) {
      console.error('Wikimedia search failed:', error)
      return []
    }
  }

  /**
   * Search for images on Pexels with fuzzy fallback
   */
  async searchPexelsImages(keywords: string[]): Promise<ImageResult[]> {
    if (!this.pexelsApiKey) {
      console.log('❌ Pexels API key not available')
      return []
    }

    // Try multiple search strategies
    const searchStrategies = this.generateSearchStrategies(keywords)
    console.log(`🔄 Trying ${searchStrategies.length} search strategies`)
    
    for (const strategy of searchStrategies) {
      try {
        console.log(`  → Searching Pexels for: "${strategy}"`)
        const response = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(strategy)}&per_page=5&orientation=landscape`,
          {
            headers: {
              'Authorization': this.pexelsApiKey,
            },
          }
        )

        if (!response.ok) {
          console.log(`  ❌ Pexels API error ${response.status}`)
          continue
        }

        const data = await response.json()
        
        if (data.photos && data.photos.length > 0) {
          console.log(`  ✅ Found ${data.photos.length} results!`)
          return data.photos.map((photo: any) => ({
            url: photo.src.large,
            alt_text: photo.alt || `Photo by ${photo.photographer}`,
            author: photo.photographer,
            source_name: 'Pexels',
            source_url: photo.url,
            license_type: 'Pexels License',
            width: photo.width,
            height: photo.height,
          }))
        } else {
          console.log(`  ⚠️  No results`)
        }
      } catch (error) {
        console.error(`  ❌ Pexels search failed:`, error)
      }
    }
    
    console.log(`❌ All Pexels strategies exhausted`)
    return []
  }

  /**
   * Search for images on Unsplash with fuzzy fallback
   */
  async searchUnsplashImages(keywords: string[]): Promise<ImageResult[]> {
    if (!this.unsplashAccessKey) {
      // console.log('Unsplash API key not available, skipping Unsplash search')
      return []
    }

    // Try multiple search strategies
    const searchStrategies = this.generateSearchStrategies(keywords)
    
    for (const strategy of searchStrategies) {
      try {
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(strategy)}&per_page=5&orientation=landscape`,
          {
            headers: {
              'Authorization': `Client-ID ${this.unsplashAccessKey}`,
            },
          }
        )

        if (!response.ok) {
          // console.log(`Unsplash API error ${response.status} for query: ${strategy}`)
          continue
        }

        const data = await response.json()
        
        if (data.results && data.results.length > 0) {
          // console.log(`Unsplash success with strategy: "${strategy}" (${data.results.length} results)`)
          return data.results.map((photo: any) => ({
            url: photo.urls.regular,
            alt_text: photo.alt_description || `Photo by ${photo.user.name}`,
            author: photo.user.name,
            source_name: 'Unsplash',
            source_url: photo.links.html,
            license_type: 'Unsplash License',
            width: photo.width,
            height: photo.height,
          }))
        } else {
          // console.log(`No results for Unsplash query: "${strategy}"`)
        }
      } catch (error) {
        console.error(`Unsplash search failed for "${strategy}":`, error)
      }
    }
    
    return []
  }

  /**
   * Get fallback image based on category with enhanced variety
   */
  getFallbackImage(category: string): ImageResult {
    // Enhanced fallback images with more variety
    const enhancedFallbacks: Record<string, string[]> = {
      'legal': [
        'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop', // Gavel
        'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=400&h=300&fit=crop', // Courthouse
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop', // Professional
      ],
      'technology': [
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop', // Office
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop', // Coding
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop', // Team
      ],
      'travel': [
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop', // Road
        'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=400&h=300&fit=crop', // Adventure
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop', // Journey
      ],
      'politics': [
        'https://images.unsplash.com/photo-1541872705-1f73c6400ec9?w=400&h=300&fit=crop', // Government
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop', // Meeting
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop', // Professional
      ],
      'relationships': [
        'https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?w=400&h=300&fit=crop', // Couple
        'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=300&fit=crop', // People
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop', // Social
      ],
      'work-stories': [
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop', // Office
        'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=300&fit=crop', // Meeting
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop', // Professional
      ],
      default: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop',
      ]
    }
    
    const categoryImages = enhancedFallbacks[category] || enhancedFallbacks.default
    const randomImage = categoryImages[Math.floor(Math.random() * categoryImages.length)]
    
    // console.log(`Using fallback image for category "${category}": ${randomImage}`)
    
    return {
      url: randomImage,
      alt_text: `${category} related content`,
      author: 'Unsplash',
      source_name: 'Unsplash',
      source_url: 'https://unsplash.com',
      license_type: 'Unsplash License',
      width: 400,
      height: 300,
    }
  }

  /**
   * Find the best image for content with intelligent routing
   */
  async findBestImageIntelligent(
    title: string,
    content: string,
    category: string
  ): Promise<ImageResult> {
    try {
      // Analyze content to determine routing strategy
      const analysis = intelligentImageRouter.analyzeContent(title, content, category)
      
      console.log(`🔍 Image routing analysis:`, {
        hasKnownEntities: analysis.hasKnownEntities,
        entities: analysis.entities.slice(0, 3),
        setting: analysis.setting,
        mood: analysis.mood,
        shouldUseWikipedia: analysis.shouldUseWikipedia
      })

      // Route 1: Known entities -> Wikipedia/Wikimedia
      if (analysis.shouldUseWikipedia && analysis.entities.length > 0) {
        console.log(`📚 Routing to Wikipedia for entities: ${analysis.entities.join(', ')}`)
        
        // Try Wikipedia first for main entities
        for (const entity of analysis.entities.slice(0, 2)) {
          const entityImages = await this.searchWikipediaEntityImages(entity)
          if (entityImages.length > 0) {
            return entityImages[0]
          }
        }
        
        // Fallback to Wikimedia search
        const wikimediaImages = await this.searchWikimediaImages(analysis.entities)
        if (wikimediaImages.length > 0) {
          return wikimediaImages[0]
        }
      }

      // Route 2: Pexels stock images with intelligent keywords
      console.log(`📸 Routing to Pexels for general content`)
      
      // Generate smart search prompt
      const stockPrompt = intelligentImageRouter.generateStockImagePrompt(title, content, category)
      const stockKeywords = stockPrompt.split(' ').filter(k => k.length > 0)
      
      console.log(`🔎 Pexels search keywords: ${stockKeywords.join(', ')}`)
      
      // Try Pexels with intelligent keywords
      if (stockKeywords.length > 0) {
        const pexelsImages = await this.searchPexelsImages(stockKeywords)
        if (pexelsImages.length > 0) {
          console.log(`✅ Found ${pexelsImages.length} Pexels images`)
          return pexelsImages[0]
        }
      }
      
      // Fallback to basic category keywords
      console.log(`⚠️  No results with smart keywords, trying basic category search`)
      const basicKeywords = this.generateImageKeywords(title, category, analysis.visualConcepts)
      const pexelsBasic = await this.searchPexelsImages(basicKeywords)
      if (pexelsBasic.length > 0) {
        console.log(`✅ Found ${pexelsBasic.length} Pexels images with basic keywords`)
        return pexelsBasic[0]
      }

      // Final fallback
      console.log(`❌ No Pexels results, using fallback image`)
      return this.getFallbackImage(category)
    } catch (error) {
      console.error('Intelligent image search failed:', error)
      return this.getFallbackImage(category)
    }
  }

  /**
   * Legacy method - keeping for backward compatibility
   */
  async findBestImage(
    keywords: string[], 
    category: string,
    entities?: Array<{
      name: string
      type: string
      confidence: number
      wikipedia_title?: string
    }>
  ): Promise<ImageResult> {
    try {
      // Priority 1: High-confidence entities with Wikipedia pages
      if (entities && entities.length > 0) {
        const highConfidenceEntities = entities
          .filter(entity => entity.confidence >= 0.8 && entity.wikipedia_title)
          .sort((a, b) => b.confidence - a.confidence)

        for (const entity of highConfidenceEntities) {
          if (entity.wikipedia_title) {
            // console.log(`Searching Wikipedia for entity: ${entity.name} (${entity.wikipedia_title})`)
            const entityImages = await this.searchWikipediaEntityImages(entity.wikipedia_title)
            if (entityImages.length > 0) {
              return entityImages[0]
            }
          }
        }

        // Priority 2: Medium-confidence entities (search by name)
        const mediumConfidenceEntities = entities
          .filter(entity => entity.confidence >= 0.6)
          .sort((a, b) => b.confidence - a.confidence)

        for (const entity of mediumConfidenceEntities) {
          // console.log(`Searching Wikimedia for entity: ${entity.name}`)
          const entityImages = await this.searchWikimediaImages([entity.name])
          if (entityImages.length > 0) {
            return entityImages[0]
          }
        }
      }

      // Priority 3: General keyword search on Wikimedia
      const wikimediaImages = await this.searchWikimediaImages(keywords)
      if (wikimediaImages.length > 0) {
        return wikimediaImages[0]
      }

      // Priority 4: Pexels stock images
      const pexelsImages = await this.searchPexelsImages(keywords)
      if (pexelsImages.length > 0) {
        return pexelsImages[0]
      }

      // Priority 5: Unsplash if available
      const unsplashImages = await this.searchUnsplashImages(keywords)
      if (unsplashImages.length > 0) {
        return unsplashImages[0]
      }

      // Priority 6: Fallback to curated category images
      return this.getFallbackImage(category)
    } catch (error) {
      console.error('Image search failed:', error)
      return this.getFallbackImage(category)
    }
  }

  /**
   * Generate multiple search strategies for fuzzy fallback
   */
  generateSearchStrategies(keywords: string[]): string[] {
    const strategies: string[] = []
    
    // Strategy 1: All keywords together
    if (keywords.length > 0) {
      strategies.push(keywords.join(' '))
    }
    
    // Strategy 2: First 2-3 most important keywords
    if (keywords.length > 1) {
      strategies.push(keywords.slice(0, 2).join(' '))
    }
    
    // Strategy 3: Individual high-value keywords
    keywords.slice(0, 3).forEach(keyword => {
      if (keyword.length > 3) {
        strategies.push(keyword)
      }
    })
    
    // Strategy 4: Broader category terms
    const categoryFallbacks = {
      'legal': 'business meeting professional',
      'technology': 'office computer modern',
      'travel': 'journey adventure outdoor',
      'politics': 'government meeting official',
      'relationships': 'people conversation social',
      'work-stories': 'office workplace business',
      'funny': 'people happy celebration',
      'aita': 'people discussion meeting'
    }
    
    // Try to extract category from keywords
    for (const [cat, fallback] of Object.entries(categoryFallbacks)) {
      if (keywords.some(k => k.includes(cat) || cat.includes(k))) {
        strategies.push(fallback)
        break
      }
    }
    
    // Strategy 5: Ultra-safe fallbacks
    strategies.push('business professional')
    strategies.push('people meeting')
    strategies.push('modern office')
    
    // Remove duplicates and empty strings
    return [...new Set(strategies)].filter(s => s.trim().length > 0)
  }

  /**
   * Generate contextual keywords from content
   */
  generateImageKeywords(
    title: string, 
    category: string, 
    contentKeywords: string[]
  ): string[] {
    const categoryKeywords: Record<string, string[]> = {
      'aita': ['people', 'conversation', 'discussion', 'meeting', 'social'],
      'revenge': ['justice', 'dramatic', 'confrontation', 'victory', 'satisfaction'],
      'relationships': ['couple', 'romance', 'dating', 'love', 'relationship'],
      'work-stories': ['office', 'workplace', 'professional', 'business', 'career'],
      'funny': ['humor', 'laughing', 'entertainment', 'comedy', 'amusing'],
      'malicious-compliance': ['rules', 'bureaucracy', 'following orders', 'technical'],
      'news': ['breaking news', 'current events', 'journalism', 'media'],
    }

    const baseKeywords = categoryKeywords[category] || ['general', 'story', 'news']
    
    // Extract meaningful words from title (remove emojis and common words)
    const titleWords = title
      .replace(/[^\w\s]/g, ' ')
      .toLowerCase()
      .split(' ')
      .filter(word => 
        word.length > 3 && 
        !['this', 'that', 'with', 'from', 'they', 'were', 'been', 'have'].includes(word)
      )
      .slice(0, 3)

    return [...baseKeywords, ...titleWords, ...contentKeywords.slice(0, 2)]
  }

  /**
   * Process image for storage (validate, resize, etc.)
   */
  async processImageForStorage(imageResult: ImageResult): Promise<{
    processed_url: string
    metadata: {
      original_url: string
      author: string
      source_name: string
      source_url: string
      license_type: string
      alt_text: string
      width?: number
      height?: number
    }
  }> {
    // In production, you might want to:
    // 1. Download and resize the image
    // 2. Upload to your CDN/storage
    // 3. Generate multiple sizes
    // 4. Validate image content
    
    // For now, return the original with metadata
    return {
      processed_url: imageResult.url,
      metadata: {
        original_url: imageResult.url,
        author: imageResult.author,
        source_name: imageResult.source_name,
        source_url: imageResult.source_url,
        license_type: imageResult.license_type,
        alt_text: imageResult.alt_text,
        width: imageResult.width,
        height: imageResult.height,
      }
    }
  }
}

// Export singleton
export const imageService = new ImageService()