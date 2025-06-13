import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <SignedOut>
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Transform Reddit into 
            <span className="text-blue-600"> Viral Content</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            ThreadJuice scrapes and curates Reddit's most outrageous threads, 
            transforming them into snackable, shareable stories with custom avatars, 
            quizzes, and automated short-form videos.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <p className="text-sm text-gray-500">
              Sign up to start creating viral content from Reddit threads
            </p>
          </div>
        </div>
      </SignedOut>
      
      <SignedIn>
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Welcome to ThreadJuice
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Ready to transform Reddit threads into viral content? 
            Let's get started building your content empire.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900">Reddit Scraper</h3>
              <p className="mt-2 text-sm text-gray-600">
                Automatically find trending threads from high-virality subreddits
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900">Content Generator</h3>
              <p className="mt-2 text-sm text-gray-600">
                Transform raw Reddit content into engaging narratives with AI
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900">Video Pipeline</h3>
              <p className="mt-2 text-sm text-gray-600">
                Create TikTok/Reels format videos with voiceover and visuals
              </p>
            </div>
          </div>
        </div>
      </SignedIn>
    </div>
  );
}