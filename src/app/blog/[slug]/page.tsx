'use client';

import BlogSidebar from '@/components/elements/BlogSidebar';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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
    <>
      <Layout 
        headerStyle={1}
        footerStyle={1}
        breadcrumbCategory={post.category} 
        breadcrumbPostTitle={post.title}
        footerClass=""
        headTitle={post.title}
        logoWhite={false}
      >
        <section className='blog-details-area pb-100 pt-80'>
          <div className='container'>
            <div className='row justify-content-center'>
              <div className='col-lg-1'>
                <div className='blog-details-social'>
                  <ul className='list-wrap'>
                    <li>
                      <Link href='#'>
                        <i className='fab fa-facebook-f' />
                      </Link>
                    </li>
                    <li>
                      <Link href='#'>
                        <i className='fab fa-twitter' />
                      </Link>
                    </li>
                    <li>
                      <Link href='#'>
                        <i className='fab fa-linkedin-in' />
                      </Link>
                    </li>
                    <li>
                      <Link href='#'>
                        <i className='fab fa-reddit' />
                      </Link>
                    </li>
                    <li>
                      <Link href='#'>
                        <i className='fas fa-share' />
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className='col-xl-8 col-lg-7'>
                <div className='blog-details-content'>
                  <div className='blog-details-thumb'>
                    <img src={post.image} alt={post.title} />
                  </div>
                  <div className='blog-details-content-wrap'>
                    <ul className='tgbanner__content-meta list-wrap'>
                      <li className='category'>
                        <Link href='/blog'>{post.category}</Link>
                      </li>
                      <li>
                        <span className='by'>By</span>{' '}
                        <Link href='/personas'>{post.author}</Link>
                      </li>
                      <li>{post.date}</li>
                    </ul>
                    <h1 className='title'>{post.title}</h1>
                    <div className='blog-details-content-inner' dangerouslySetInnerHTML={{ __html: post.content }} />
                    
                    <div className='blog-details-tags'>
                      <ul className='list-wrap'>
                        <li className='tags-title'>Tags:</li>
                        <li><Link href='#'>reddit</Link></li>
                        <li><Link href='#'>aita</Link></li>
                        <li><Link href='#'>roommates</Link></li>
                        <li><Link href='#'>tiktok</Link></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className='col-xl-3 col-lg-4 col-md-6'>
                <BlogSidebar />
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}