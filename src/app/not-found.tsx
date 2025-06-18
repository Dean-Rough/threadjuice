import { Metadata } from 'next';
import Link from 'next/link';
import { AlertCircle, Home, Search, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description:
    'The page you are looking for could not be found. Explore trending Reddit stories and viral content on ThreadJuice.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 Icon */}
          <div className="mb-8">
            <AlertCircle size={120} className="text-primary mx-auto" />
          </div>

          {/* 404 Title */}
          <h1 className="text-4xl font-bold mb-4">Oops! Page Not Found</h1>

          {/* 404 Description */}
          <p className="text-muted-foreground text-lg mb-8">
            The page you&apos;re looking for seems to have gone viral and
            disappeared into the Reddit void. Don&apos;t worry though, we
            have plenty of other engaging content for you to explore.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg">
              <Link href="/">
                <Home size={20} className="mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">
                <TrendingUp size={20} className="mr-2" />
                View Trending
              </Link>
            </Button>
          </div>

          {/* Search Suggestion */}
          <div className="mb-12">
            <p className="text-muted-foreground mb-4">
              Or try searching for something specific:
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <Input 
                type="text" 
                placeholder="Search viral threads..."
                className="flex-1"
              />
              <Button variant="outline" size="icon">
                <Search size={20} />
              </Button>
            </div>
          </div>

          {/* Popular Content Suggestions */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🔥 Trending Stories</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Discover the hottest Reddit threads transformed into
                  engaging narratives.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/">Explore Trending</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🤖 AI Personas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Meet our AI writers and explore their unique
                  perspectives on viral content.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/">Meet Personas</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📚 Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Browse stories by topic - from technology to
                  entertainment and beyond.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/">Browse Categories</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}