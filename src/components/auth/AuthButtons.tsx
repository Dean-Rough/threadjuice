'use client';

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs';

export default function AuthButtons() {
  return (
    <>
      <SignedOut>
        <li className='news-btn'>
          <SignInButton mode='modal'>
            <button className='btn'>
              <span className='btn-text'>Sign In</span>
            </button>
          </SignInButton>
        </li>
        <li className='news-btn'>
          <SignUpButton mode='modal'>
            <button className='btn btn-primary'>
              <span className='btn-text'>Sign Up</span>
            </button>
          </SignUpButton>
        </li>
      </SignedOut>
      <SignedIn>
        <li className='user-profile'>
          <UserButton
            afterSignOutUrl='/'
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8',
              },
            }}
          />
        </li>
      </SignedIn>
    </>
  );
}
