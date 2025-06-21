'use client';

import React, { useState, useRef } from 'react';
import { ExternalLink } from 'lucide-react';

interface HoverLinkProps {
  href: string;
  children: React.ReactNode;
  preview?: {
    title?: string;
    description?: string;
    image?: string;
    domain?: string;
  };
  className?: string;
  external?: boolean;
}

export default function HoverLink({
  href,
  children,
  preview,
  className = '',
  external = true
}: HoverLinkProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
  const linkRef = useRef<HTMLAnchorElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      const rect = e.currentTarget.getBoundingClientRect();
      setPreviewPosition({
        x: rect.left + rect.width / 2,
        y: rect.bottom + 10
      });
      setShowPreview(true);
    }, 500); // Show preview after 500ms hover
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowPreview(false);
  };

  const getPreviewData = () => {
    if (preview) return preview;

    // Handle special cases
    if (!href || href === '#') {
      return {
        title: "Link not available",
        description: "This link is not yet configured",
        domain: "ThreadJuice"
      };
    }

    try {
      // Auto-generate preview based on href
      const url = new URL(href.startsWith('http') ? href : `https://${href}`);
      const domain = url.hostname;
      
      // Generate preview based on common domains
      if (domain.includes('buzzfeed')) {
        return {
          title: "17 Pizza Reheating Methods That Will Change Your Life",
          description: "From the obvious to the absolutely ridiculous, these pizza reheating methods will revolutionize your leftover game.",
          domain: "BuzzFeed",
          image: "/api/placeholder/300/150"
        };
      } else if (domain.includes('nytimes')) {
        return {
          title: "The Science of Reheating: A Thermal Analysis",
          description: "Food science meets kitchen practicality in this comprehensive guide to optimal food reheating techniques.",
          domain: "The New York Times",
          image: "/api/placeholder/300/150"
        };
      } else if (domain.includes('foodnetwork')) {
        return {
          title: "Reheat Masters: New Show Coming This Fall",
          description: "Professional chefs compete to create the most innovative leftover transformation techniques.",
          domain: "Food Network",
          image: "/api/placeholder/300/150"
        };
      }

      return {
        title: url.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Link Preview',
        description: `Visit ${domain} for more information`,
        domain: domain,
        image: "/api/placeholder/300/150"
      };
    } catch (error) {
      // Invalid URL, return default preview
      return {
        title: "External Link",
        description: href,
        domain: "Link"
      };
    }
  };

  const previewData = getPreviewData();

  return (
    <>
      <a
        ref={linkRef}
        href={href}
        target={external ? '_blank' : '_self'}
        rel={external ? 'noopener noreferrer' : undefined}
        className={`inline-flex items-center gap-1 text-orange-500 hover:text-orange-600 underline decoration-orange-500/30 hover:decoration-orange-600 transition-colors ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
        {external && <ExternalLink className="h-3 w-3" />}
      </a>

      {/* Hover Preview */}
      {showPreview && (
        <div 
          className="fixed z-50 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-4 pointer-events-none"
          style={{
            left: `${previewPosition.x}px`,
            top: `${previewPosition.y}px`,
            transform: 'translateX(-50%)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {previewData.image && (
            <div className="w-full h-32 bg-slate-100 dark:bg-slate-700 rounded-md mb-3 overflow-hidden">
              <img 
                src={previewData.image} 
                alt={previewData.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-foreground line-clamp-2">
              {previewData.title}
            </h4>
            
            {previewData.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {previewData.description}
              </p>
            )}
            
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-600">
              <span className="text-xs font-medium text-orange-500">
                {previewData.domain}
              </span>
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </>
  );
}