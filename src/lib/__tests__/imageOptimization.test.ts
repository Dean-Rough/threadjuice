import {
  imageConfig,
  imageDimensions,
  getOptimizedImageProps,
  generateBlurDataUrl,
  preloadImage,
  createImageObserver,
  compressImage,
  supportsWebP,
  generateSrcSet,
  buildImageUrl,
} from '../imageOptimization';

// Mock DOM APIs
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: jest.fn(() => ({
    fillStyle: '',
    fillRect: jest.fn(),
    drawImage: jest.fn(),
    createLinearGradient: jest.fn(() => ({
      addColorStop: jest.fn(),
    })),
  })),
  toDataURL: jest.fn(() => 'data:image/jpeg;base64,mock'),
  toBlob: jest.fn(callback => callback(new Blob())),
};

const mockImage = {
  onload: null as any,
  src: '',
  width: 800,
  height: 600,
};

const mockLink = {
  rel: '',
  as: '',
  href: '',
};

// Mock document and window
(global as any).document = {
  createElement: jest.fn((tag: string) => {
    if (tag === 'canvas') return mockCanvas;
    if (tag === 'link') return mockLink;
    return {};
  }),
  head: {
    appendChild: jest.fn(),
  },
};

// Only mock window properties if they don't exist
if (!(global as any).window) {
  (global as any).window = {};
}

(global as any).window.location = { origin: 'https://test.com' };

// Mock URL constructor for this specific test  
const MockURL = class {
  public searchParams: { set: (key: string, value: string) => void };
  public href: string;
  
  constructor(url: string, base?: string) {
    // Simple URL construction without recursion
    this.href = url.startsWith('http') ? url : (base || 'https://test.com') + url;
    this.searchParams = {
      set: (key: string, value: string) => {
        // Simple query param handling
        const separator = this.href.includes('?') ? '&' : '?';
        this.href = this.href + separator + key + '=' + value;
      }
    };
  }
  
  toString() {
    return this.href;
  }
  
  static createObjectURL = jest.fn(() => 'blob:mock-url');
};

Object.defineProperty(global, 'Image', {
  value: jest.fn(() => mockImage),
  configurable: true,
});

// Temporarily override URL for this test file
const originalURL = global.URL;
beforeAll(() => {
  global.URL = MockURL as any;
});

afterAll(() => {
  global.URL = originalURL;
});

describe('Image Optimization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('imageConfig', () => {
    it('should have correct default configuration', () => {
      expect(imageConfig.quality).toBe(85);
      expect(imageConfig.format).toBe('webp');
      expect(imageConfig.placeholder).toBe('blur');
      expect(imageConfig.loading).toBe('lazy');
    });

    it('should have responsive sizes configured', () => {
      expect(imageConfig.sizes.mobile).toContain('max-width: 768px');
      expect(imageConfig.sizes.desktop).toBeDefined();
      expect(imageConfig.sizes.hero).toBeDefined();
    });
  });

  describe('imageDimensions', () => {
    it('should have standard image dimensions', () => {
      expect(imageDimensions.hero).toEqual({ width: 1200, height: 600 });
      expect(imageDimensions.thumbnail).toEqual({ width: 300, height: 200 });
      expect(imageDimensions.avatar).toEqual({ width: 100, height: 100 });
    });
  });

  describe('getOptimizedImageProps', () => {
    it('should return optimized props for hero images', () => {
      const props = getOptimizedImageProps('/test.jpg', 'hero', 'Test image');

      expect(props.src).toBe('/test.jpg');
      expect(props.alt).toBe('Test image');
      expect(props.width).toBe(1200);
      expect(props.height).toBe(600);
      expect(props.quality).toBe(85);
      expect(props.sizes).toBe(imageConfig.sizes.hero);
    });

    it('should return optimized props for thumbnails', () => {
      const props = getOptimizedImageProps(
        '/thumb.jpg',
        'thumbnail',
        'Thumbnail'
      );

      expect(props.width).toBe(300);
      expect(props.height).toBe(200);
      expect(props.sizes).toBe(imageConfig.sizes.thumbnail);
    });

    it('should merge custom options', () => {
      const props = getOptimizedImageProps('/test.jpg', 'hero', 'Test', {
        priority: true,
        style: { borderRadius: '8px' },
      });

      expect(props.priority).toBe(true);
      expect(props.style).toMatchObject({
        objectFit: 'cover',
        borderRadius: '8px',
      });
    });
  });

  describe('generateBlurDataUrl', () => {
    it('should generate blur data URL', () => {
      const result = generateBlurDataUrl(100, 100);

      expect(mockCanvas.width).toBe(100);
      expect(mockCanvas.height).toBe(100);
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.1);
      expect(result).toBe('data:image/jpeg;base64,mock');
    });

    it('should return fallback for SSR', () => {
      // Temporarily remove document
      const originalDocument = global.document;
      delete (global as any).document;

      const result = generateBlurDataUrl(100, 100);

      expect(result).toContain('data:image/jpeg;base64');

      // Restore document
      global.document = originalDocument;
    });
  });

  describe('preloadImage', () => {
    it('should preload image in browser', () => {
      preloadImage('/test.jpg');

      expect(document.createElement).toHaveBeenCalledWith('link');
      expect(mockLink.rel).toBe('preload');
      expect(mockLink.as).toBe('image');
      expect(mockLink.href).toBe('/test.jpg');
      expect(document.head.appendChild).toHaveBeenCalledWith(mockLink);
    });

    it('should not preload in SSR', () => {
      // Temporarily remove window
      const originalWindow = global.window;
      delete (global as any).window;

      preloadImage('/test.jpg');

      // Should not crash and not call document methods
      expect(document.createElement).not.toHaveBeenCalled();

      // Restore window
      global.window = originalWindow;
    });
  });

  describe('createImageObserver', () => {
    const mockIntersectionObserver = jest.fn();

    beforeEach(() => {
      global.IntersectionObserver = mockIntersectionObserver;
    });

    it('should create intersection observer', () => {
      const callback = jest.fn();
      const observer = createImageObserver(callback);

      expect(mockIntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        {
          root: null,
          rootMargin: '50px',
          threshold: 0.1,
        }
      );
    });

    it('should return null when IntersectionObserver not available', () => {
      delete (global as any).IntersectionObserver;

      const callback = jest.fn();
      const observer = createImageObserver(callback);

      expect(observer).toBeNull();
    });

    it('should return null in SSR', () => {
      const originalWindow = global.window;
      delete (global as any).window;

      const callback = jest.fn();
      const observer = createImageObserver(callback);

      expect(observer).toBeNull();

      global.window = originalWindow;
    });
  });

  describe('compressImage', () => {
    it('should compress image file', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      // Mock image load
      setTimeout(() => {
        if (mockImage.onload) {
          mockImage.onload();
        }
      }, 0);

      const result = await compressImage(mockFile, 800, 600, 0.8);

      expect(result).toBeInstanceOf(Blob);
      expect(mockCanvas.width).toBe(800);
      expect(mockCanvas.height).toBe(600);
    });

    it('should maintain aspect ratio', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      mockImage.width = 1600;
      mockImage.height = 800;

      setTimeout(() => {
        if (mockImage.onload) {
          mockImage.onload();
        }
      }, 0);

      await compressImage(mockFile, 800, 600, 0.8);

      // Should scale width-first (1600 -> 800, 800 -> 400)
      expect(mockCanvas.width).toBe(800);
      expect(mockCanvas.height).toBe(400);
    });
  });

  describe('supportsWebP', () => {
    it('should detect WebP support', () => {
      mockCanvas.toDataURL.mockReturnValue('data:image/webp;base64,mock');

      const result = supportsWebP();

      expect(result).toBe(true);
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/webp');
    });

    it('should return false when WebP not supported', () => {
      mockCanvas.toDataURL.mockReturnValue('data:image/png;base64,mock');

      const result = supportsWebP();

      expect(result).toBe(false);
    });

    it('should return false in SSR', () => {
      const originalWindow = global.window;
      delete (global as any).window;

      const result = supportsWebP();

      expect(result).toBe(false);

      global.window = originalWindow;
    });
  });

  describe('generateSrcSet', () => {
    it('should generate srcSet with default widths', () => {
      const result = generateSrcSet('/test.jpg');

      expect(result).toContain('320w');
      expect(result).toContain('640w');
      expect(result).toContain('1920w');
      expect(result.split(',').length).toBe(6); // Default widths array length
    });

    it('should generate srcSet with custom widths', () => {
      const result = generateSrcSet('/test.jpg', [400, 800]);

      expect(result).toContain('400w');
      expect(result).toContain('800w');
      expect(result.split(',').length).toBe(2);
    });
  });

  describe('buildImageUrl', () => {
    it('should build Next.js image URL with parameters', () => {
      const result = buildImageUrl('/test.jpg', {
        width: 800,
        height: 600,
        quality: 90,
        format: 'webp',
      });

      expect(result).toContain('/_next/image');
      expect(result).toContain('url=%2Ftest.jpg');
      expect(result).toContain('q=90');
      expect(result).toContain('w=800');
    });

    it('should use default quality when not specified', () => {
      const result = buildImageUrl('/test.jpg', { width: 400 });

      expect(result).toContain('q=85');
      expect(result).toContain('w=400');
    });

    it('should handle URL without dimensions', () => {
      const result = buildImageUrl('/test.jpg');

      expect(result).toContain('/_next/image');
      expect(result).toContain('q=85');
      expect(result).not.toContain('w=');
      expect(result).not.toContain('h=');
    });
  });

  describe('Error handling', () => {
    it('should handle missing canvas context gracefully', () => {
      mockCanvas.getContext.mockReturnValue(null);

      const result = generateBlurDataUrl(100, 100);

      expect(result).toBe('');
    });

    it('should handle image compression errors gracefully', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      mockCanvas.toBlob.mockImplementation(callback => callback(null));

      setTimeout(() => {
        if (mockImage.onload) {
          mockImage.onload();
        }
      }, 0);

      const result = await compressImage(mockFile);

      expect(result).toBeInstanceOf(Blob);
    });
  });
});
