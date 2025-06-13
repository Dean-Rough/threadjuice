import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <div className='grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20'>
      <main className='row-start-2 flex flex-col items-center gap-8 sm:items-start'>
        <h1 className='text-4xl font-bold'>Welcome to ThreadJuice</h1>
        <p className='text-center text-lg sm:text-left'>
          Your AI-powered discussion platform that doesn&apos;t suck.
        </p>

        <div className='flex flex-col items-center gap-4'>
          <SignedOut>
            <SignInButton>
              <button className='rounded-full border border-solid border-transparent bg-foreground px-4 py-2 text-sm text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]'>
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <div className='flex items-center gap-4'>
              <p>Welcome back!</p>
              <UserButton afterSignOutUrl='/' />
            </div>
          </SignedIn>
        </div>

        <div className='flex gap-4 flex-col sm:flex-row'>
          <a
            className='flex h-10 items-center justify-center rounded-md border border-solid border-black/[.08] px-4 text-sm transition-colors hover:border-transparent hover:bg-[#f2f2f2] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] sm:h-12 sm:min-w-44 sm:px-5 sm:text-base'
            href='https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app'
            target='_blank'
            rel='noopener noreferrer'
          >
            Browse Templates
          </a>
          <a
            className='flex h-10 items-center justify-center rounded-md border border-solid border-transparent bg-foreground px-4 text-sm text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] sm:h-12 sm:min-w-44 sm:px-5 sm:text-base'
            href='https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app'
            target='_blank'
            rel='noopener noreferrer'
          >
            Read our docs
          </a>
        </div>
      </main>
    </div>
  );
}
