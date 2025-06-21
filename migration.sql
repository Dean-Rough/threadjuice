-- ThreadJuice Stories Migration
-- Run this in Supabase SQL Editor

-- Temporarily disable RLS
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;

-- Insert stories

INSERT INTO posts (
  title, slug, hook, content, category, featured, trending_score, 
  view_count, share_count, featured_image, status, created_at, updated_at
) VALUES (
  'Absolutely Mental: Influencer''s ''Raw Authentic'' Morning Routine Video Accidentally Shows Ring Light Setup in Mirror',
  'absolutely-mental-influencer-s-raw-authentic-morning-routine',
  'Nothing says ''real morning routine'' like accidentally filming your professional lighting setup while preaching about ''natural beauty'' to 2 million followers.',
  '{"sections":[{"type":"describe-1","title":"The Setup","content":"Bella Rose has built her entire brand on authenticity. ''Real morning routines,'' ''no-makeup selfies,'' ''just woke up like this'' content that resonates with her 2.3 million followers who crave genuine connection in an increasingly fake world.\n\nToo bad she forgot to check what was behind her when she hit record."},{"type":"image","title":"The Evidence","content":"The moment when everything became crystal clear.","metadata":{"context":"Visual proof of the situation","imageCredit":"Generated illustration"}},{"type":"quotes","content":"The irony of preaching natural beauty while surrounded by professional lighting equipment was apparently lost on everyone except the internet.","metadata":{"attribution":"The moment everything clicked","context":"When reality hit"}},{"type":"describe-2","title":"How It All Unfolded","content":"The video started like all her others. ''Good morning, beautiful souls! Welcome to my completely natural, no-filter morning routine.'' Bella''s hair looked effortlessly tousled, her skin glowed with that perfect ''just woke up'' luminescence her followers envied.\n\nBut in the background, just visible in the corner of her vanity mirror, was the telltale outline of a professional ring light. And next to it, what appeared to be a makeup artist''s kit."},{"type":"comments-1","title":"The Internet Reacts","content":"The collective response was swift and merciless.","metadata":{"platform":"Social Media","engagement":"High viral potential"}},{"type":"discussion","title":"The Bigger Picture","content":"The influencer authenticity paradox is real: the more someone insists they''re ''keeping it real,'' the more likely they are to be performing realness as a brand strategy.\n\nBut the deeper issue is how authenticity itself has become a commodity to be packaged and sold to audiences hungry for genuine connection.\n\nThe Terry observes this phenomenon reveals the artificial nature of modern social dynamics—where trust becomes vulnerability, and neighbors become unwitting business partners in digital exploitation."},{"type":"quotes","content":"Sometimes the most ordinary situations reveal the most extraordinary truths about human nature.","metadata":{"attribution":"The Terry''s final observation","context":"Peak wisdom moment"}},{"type":"outro","title":"The Takeaway","content":"Bella''s follower count actually increased after the lighting equipment reveal—apparently, people appreciated the accidental honesty more than the performed authenticity. The lesson? Sometimes the most authentic thing you can do is admit you''re not that authentic."}]}',
  'Internet Culture',
  false,
  100,
  5380,
  62,
  '/assets/img/blog/blog12.jpg',
  'published',
  '2025-06-20T17:07:19.571Z',
  '2025-06-20T17:52:39.703Z'
);

INSERT INTO posts (
  title, slug, hook, content, category, featured, trending_score, 
  view_count, share_count, featured_image, status, created_at, updated_at
) VALUES (
  'Absolutely Mental: Person Does Thing',
  'absolutely-mental-person-does-thing',
  'A thing happened.',
  '{"sections":[{"type":"describe-1","title":"What Happened","content":"Someproperly mental thing unfolded in peak internet fashion. It was a properly mental thing. The artificial person did it.\n\nThe Terry observes this dystopian behavior reveals the absurd nature of modern existence."},{"type":"describe-2","title":"More Details","content":"There were more details. They were details about the properly mental thing.\n\nThe Terry observes this dystopian behavior reveals the absurd nature of modern existence."},{"type":"quotes","content":"The audacity of some people never ceases to amaze me.\n\nThe situation escalated beyond anyone''s expectations, revealing layers of complexity that nobody saw coming. What started as a simple interaction transformed into a case study of modern human behavior, complete with all the artificial drama and genuine consequences that define our digital age.","metadata":{"attribution":"The moment everything clicked","context":"When reality hit"}},{"type":"discussion","title":"The Bigger Picture","content":"This isn''t just about one incident—it''s a window into the artificial nature of modern social dynamics. The Terry notes this phenomenon reveals how we''ve created systems where basic human interactions become performative theater.\n\nWhen everyday situations become content for viral entertainment, we''ve crossed into properly dystopian territory."},{"type":"outro","title":"The Takeaway","content":"In the end, life continued with slightly more awareness of the absurd. Sometimes the most ordinary things reveal the most extraordinary truths about human nature."}]}',
  'General',
  false,
  30,
  100,
  1,
  '/assets/img/blog/blog01.jpg',
  'published',
  '2025-06-20T16:22:59.325Z',
  '2025-06-20T17:52:39.704Z'
);

INSERT INTO posts (
  title, slug, hook, content, category, featured, trending_score, 
  view_count, share_count, featured_image, status, created_at, updated_at
) VALUES (
  'Absolutely Mental: Woman Discovers Her Neighbor Has Been Using Her WiFi to Mine Cryptocurrency for Three Years',
  'absolutely-mental-woman-discovers-her-neighbor-has-been-usin',
  'Three years of mysteriously high electricity bills finally explained when Sarah discovered her ''helpful'' neighbor Bob had been running a full crypto mining operation off her internet connection.',
  '{"sections":[{"type":"describe-1","title":"The Setup","content":"Sarah Patterson thought she was going crazy. For three years, her electricity bills had been climbing steadily, despite no changes to her usage patterns. No new appliances, no lifestyle changes, just mysteriously increasing costs that made her question everything from her meter to her sanity.\n\nThen she decided to check her WiFi settings."},{"type":"image","title":"The Evidence","content":"The moment when everything became crystal clear.","metadata":{"context":"Visual proof of the situation","imageCredit":"Generated illustration"}},{"type":"quotes","content":"I trusted this man with my spare key when I went on vacation. He was watering my plants while mining Bitcoin in my basement.","metadata":{"attribution":"The moment everything clicked","context":"When reality hit"}},{"type":"describe-2","title":"How It All Unfolded","content":"What Sarah found in her router logs changed everything. Unknown devices. Massive data usage during hours when she was asleep. Traffic patterns that looked nothing like her Netflix-and-email lifestyle.\n\nA little detective work revealed the truth: her neighbor Bob, the guy who''d been ''so helpful'' when she moved in three years ago, had somehow gained access to her network. Not just casual browsing access—full-scale cryptocurrency mining operation access."},{"type":"comments-1","title":"The Internet Reacts","content":"The collective response was swift and merciless.","metadata":{"platform":"Social Media","engagement":"High viral potential"}},{"type":"discussion","title":"The Bigger Picture","content":"This isn''t just about WiFi theft—it''s about the erosion of basic trust in an increasingly connected world. When your neighbor can literally profit off your utilities without your knowledge, what does that say about digital privacy and consent?\n\nThe cryptocurrency angle makes it even more insidious. Bob wasn''t just checking email on Sarah''s dime; he was running a business operation that transferred the costs to an unknowing victim.\n\nThe Terry observes this phenomenon reveals the artificial nature of modern social dynamics—where trust becomes vulnerability, and neighbors become unwitting business partners in digital exploitation."},{"type":"quotes","content":"Sometimes the most ordinary situations reveal the most extraordinary truths about human nature.","metadata":{"attribution":"The Terry''s final observation","context":"Peak wisdom moment"}},{"type":"outro","title":"The Takeaway","content":"Sarah changed her WiFi password and filed a police report. Bob moved out the following month, presumably to find new neighbors with better security practices. The electricity bill returned to normal, but the trust in neighborhood relationships? That''s going to take longer to restore."}]}',
  'Tech Drama',
  false,
  100,
  3284,
  34,
  '/assets/img/technology/tech_01.jpg',
  'published',
  '2025-06-20T17:14:13.016Z',
  '2025-06-20T17:52:39.704Z'
);

INSERT INTO posts (
  title, slug, hook, content, category, featured, trending_score, 
  view_count, share_count, featured_image, status, created_at, updated_at
) VALUES (
  'Company''s Mandatory ''Fun'' Day Includes Escape Room Where Employees Can''t Actually Escape',
  'company-s-mandatory-fun-day-includes-escape-room-where-emplo',
  'What started as mandatory team building turned into a real-life psychological experiment when employees realized the ''escape room'' doors actually wouldn''t open.',
  '{"sections":[{"type":"describe-1","title":"The Setup","content":"The email subject line read ''Mandatory Fun Day - Team Escape Room Adventure!'' and honestly, that should have been the first red flag. When your company needs to mandate fun, you''re already in trouble.\n\nBut nobody at TechFlow Solutions was prepared for just how literal the ''escape room'' would be.","enhanced":true},{"type":"describe-2","title":"How It All Unfolded","content":"The team building started normally enough. Puzzles to solve, clues to find, that artificial camaraderie that happens when adults are forced to pretend work is a game. But after the final puzzle was solved and the team cheered their victory, something became clear.\n\nThe door handle turned, but the door didn''t open. The employees laughed it off at first—probably just part of the experience, right? Except ten minutes passed. Then twenty. The facilitator looked confused. The manager looked concerned."},{"type":"quotes","content":"The truly dystopian part wasn''t being trapped. It was realizing our company had accidentally created the perfect metaphor for our employment situation.","metadata":{"attribution":"The moment everything clicked","context":"When reality hit"}},{"type":"discussion","title":"The Bigger Picture","content":"The ''mandatory fun'' phenomenon reveals something deeper about modern workplace culture. When companies need to force enjoyment, it suggests they know something is fundamentally broken about the employee experience.\n\nThe fact that the escape room doors actually wouldn''t open? That''s not just poor planning—it''s accidentally honest about how many people feel about their jobs."},{"type":"outro","title":"The Takeaway","content":"The employees were eventually released after facilities management found the right key. TechFlow Solutions cancelled all future mandatory fun days, which was probably the most fun the employees had in years."}]}',
  'Workplace Drama',
  false,
  100,
  3414,
  38,
  '/assets/img/blog/blog15.jpg',
  'published',
  '2025-06-20T16:44:12.847Z',
  '2025-06-20T17:52:39.704Z'
);

INSERT INTO posts (
  title, slug, hook, content, category, featured, trending_score, 
  view_count, share_count, featured_image, status, created_at, updated_at
) VALUES (
  'Dating App Match Turns Out to Be Her Boss''s Wife Looking for ''Friendship'' (Boss Doesn''t Know)',
  'dating-app-match-turns-out-to-be-her-boss-s-wife-looking-for',
  'The awkward moment when your Bumble match shows up to coffee and you realize she''s married to the guy who signs your paychecks.',
  '{"sections":[{"type":"describe-1","title":"The Setup","content":"The coffee shop was crowded, but Lisa spotted her immediately. Same height as in the photos, same curly hair, same bright smile. Perfect.\n\nExcept for one tiny detail that somehow didn''t make it into her Bumble profile: she was wearing a wedding ring. And not just any wedding ring—one Lisa recognized from countless office holiday parties.","enhanced":true},{"type":"describe-2","title":"How It All Unfolded","content":"The recognition was mutual and immediate. Jennifer Kim, Senior Marketing Director at Lisa''s company. The woman whose husband Michael had been Lisa''s direct supervisor for the past eighteen months.\n\nJennifer''s eyes went wide. Lisa''s stomach dropped. The carefully crafted Bumble conversation about ''looking for genuine connections'' suddenly took on a very different meaning."},{"type":"quotes","content":"Nothing quite prepares you for the moment when your dating life and professional life collide in the most awkward way possible.","metadata":{"attribution":"The moment everything clicked","context":"When reality hit"}},{"type":"discussion","title":"The Bigger Picture","content":"Modern dating apps have created a false sense of anonymity that doesn''t account for how small professional and social circles actually are. When your digital life collides with your real life, the results can be professionally and personally devastating.\n\nThe ethics become even murkier when marriage and workplace hierarchies enter the picture."},{"type":"outro","title":"The Takeaway","content":"Lisa deleted her dating apps and requested a transfer to a different department. Jennifer presumably had some interesting conversations at home. Sometimes the best match is the one you don''t pursue."}]}',
  'Relationship Drama',
  false,
  100,
  4540,
  49,
  '/assets/img/blog/blog08.jpg',
  'published',
  '2025-06-20T14:00:06.152Z',
  '2025-06-20T17:52:39.704Z'
);

INSERT INTO posts (
  title, slug, hook, content, category, featured, trending_score, 
  view_count, share_count, featured_image, status, created_at, updated_at
) VALUES (
  'Food Twitter Civil War Erupts Over Whether Microwaving Leftover Pizza is a Crime Against Humanity',
  'food-twitter-civil-war-erupts-over-whether-microwaving-leftover-pizza-is-a-crime-against-humanity',
  'A innocent poll about reheating methods triggered 567 quote tweets of pure culinary rage, scientific papers about heat distribution, and deeply personal stories about childhood pizza trauma.',
  '{"sections":[{"type":"describe-1","title":"The Tweet That Broke Food Twitter","content":"It started so innocently. @PizzaPurist92 posted what they thought was a simple poll: \"Reheating leftover pizza: Microwave (30 sec) vs Oven (5 min) vs Pan (2 min) vs Cold (like a barbarian)?\" \n\nWithin minutes, the replies section transformed into a battlefield where culinary science met personal trauma, and everyone had Very Strong Opinions about optimal pizza temperature distribution. The humble pizza slice had become the unlikely flashpoint for debates about kitchen privilege, time economics, and what constitutes \"proper\" food preparation.\n\nWhat @PizzaPurist92 didn''t anticipate was that their innocent poll would become the catalyst for Food Twitter''s most heated debate since the great pineapple wars of 2019. By the time the dust settled, we''d have physics professors explaining thermal dynamics, Italian nonnas cursing in three languages, and broke college students defending their microwave-based survival strategies.\n\nThe Terry notes this is exactly the sort of perfectly reasonable question that sends Food Twitter into complete meltdown. Because apparently, asking how to reheat pizza is like asking someone to choose their favourite child - deeply personal, surprisingly divisive, and guaranteed to reveal far more about society than anyone bargained for."},{"type":"image","content":"The battleground: A perfectly innocent pizza slice that would soon divide the internet into warring factions of reheating purists","metadata":{"image_prompt":"leftover pizza slice on a plate"}},{"type":"quotes","content":"Imagine gatekeeping happiness and then calling other people barbarians for eating cold pizza at 2 AM during a breakdown.","metadata":{"attribution":"@MidnightMunchies47","context":"The quote tweet that started the real drama"}},{"type":"describe-2","title":"The Science Squad Arrives","content":"Professional chefs descended like culinary vultures, armed with physics explanations and temperature charts. @ChefThermal provided a 12-tweet thread about heat distribution patterns, complete with diagrams that looked like something from a thermal engineering textbook.\n\n\"The microwave creates hot spots due to standing wave patterns,\" they explained with the confidence of someone who''d clearly never eaten a slice at 3 AM in their dressing gown. Apparently unaware that most people just want edible pizza without a physics degree, they proceeded to explain electromagnetic radiation as if we were all PhD candidates in Food Science.\n\nMeanwhile, @FoodScienceNerd shared actual research papers about moisture retention in reheated carbohydrates. Because nothing says \"casual lunch\" like peer-reviewed literature about pizza crust integrity. The Terry appreciates thoroughness, but this felt less like helpful advice and more like academic flexing at the expense of people who just want warm cheese.\n\nThe real entertainment began when @ItalianNonnaRage entered the chat, announcing in broken English and perfect fury that her late husband would be \"spinning in his grave like a rotisserie chicken\" at this entire conversation. She proceeded to explain, in increasingly capital letters, that \"REAL PIZZA DOESN''T NEED REHEATING BECAUSE YOU EAT IT FRESH LIKE CIVILIZED PEOPLE.\"\n\nThe scientific crowd tried to explain thermal dynamics to an 82-year-old woman from Naples. It went about as well as you''d expect."},{"type":"comments-1","title":"The Personal Confessions Begin","content":"As the thread exploded, people started sharing deeply personal pizza stories that nobody asked for but everyone needed to hear.","metadata":{"comments":[{"author":"BrokeCollegeKid","content":"Y''all had access to ovens? We had a microwave older than some of my professors and we were GRATEFUL.","score":1247,"replies":89},{"author":"ItalianNonna47","content":"My grandmother is rolling in her grave at this entire conversation. She never had a microwave and her leftover pizza was perfect every time.","score":892,"replies":156},{"author":"RegionalPizzaLoyalist","content":"Chicago deep dish vs NY thin crust changes everything. You can''t apply the same reheating rules to different pizza architectures.","score":567,"replies":234}]}},{"type":"discussion","title":"When Food Becomes Class Warfare","content":"The real drama emerged when the conversation shifted from reheating methods to access and privilege. @WorkingClassEats pointed out that not everyone has the luxury of \"proper\" kitchen equipment or the time for elaborate reheating rituals.\n\n\"Some of us eat cold pizza for breakfast while getting three kids ready for school,\" they tweeted. \"Your cast iron pan method is very cute though.\"\n\nThis single tweet cracked open the entire facade of Food Twitter''s performative sophistication. Suddenly, the pizza debate became a mirror reflecting broader societal issues about food access, time poverty, and kitchen privilege. Because nothing escalates quite like Food Twitter when it realizes it''s accidentally discussing economics.\n\nThe Terry observed the magnificent pivot from \"optimal thermal distribution\" to \"check your kitchen privilege\" with the sort of fascination usually reserved for wildlife documentaries. Within an hour, we had people confessing to eating cereal for dinner, microwaving pasta water, and storing leftover Chinese takeaway in the cardboard containers because washing dishes is apparently for people with both time and energy.\n\n@SingleParentSurvival dropped perhaps the most devastating response: \"I haven''t had leftover pizza in three years because my kids eat it all. What''s this ''reheating'' you speak of?\" The quote tweets to this particular comment could have powered a small nuclear reactor with their concentrated guilt and recognition.\n\nMeanwhile, @KitchenMinimalist pointed out that some people live in studio apartments where the \"oven\" is actually just a toaster oven balanced on top of a mini-fridge. The cast iron pan crowd went suspiciously quiet after that reality check."},{"type":"quotes","content":"The fact that we''re having a moral panic about microwave pizza while people are struggling to afford any pizza is peak internet energy.","metadata":{"attribution":"@FoodEquityNow","context":"The reality check that went viral"}},{"type":"outro","title":"The Aftermath and Lessons Learned","content":"By the time the dust settled 48 hours later, @PizzaPurist92''s innocent poll had generated over 567 quote tweets, 1,200 replies, spawned seventeen different think pieces about food culture in America, and somehow managed to trend alongside actual news events. The Terry notes this is peak internet behavior - taking something delightfully mundane and transforming it into a sociology thesis with extra cheese.\n\nLocal pizza shops started posting their own reheating recommendations with the desperation of small businesses trying to ride any viral wave. Food blogs scrambled to publish \"definitive guides\" to leftover pizza, complete with step-by-step photos and affiliate links to pizza stones. Someone created a \"Pizza Reheating Personality Quiz\" that went viral on TikTok, because apparently everything must be content now.\n\nBuzzFeed published \"17 Pizza Reheating Methods That Will Change Your Life\" within six hours. The New York Times food section editor was reportedly seen muttering about commissioning a \"serious piece\" on thermal food dynamics. Food Network probably started developing a show called \"Reheat Masters\" before the weekend was over.\n\nThe original poll results? Microwave won with 34% of the vote, followed by oven at 28%, pan at 23%, and cold pizza at 15%. But the real winner was the internet''s infinite capacity to turn any topic into a multi-faceted cultural battlefield where everyone''s simultaneously right, wrong, and personally attacked.\n\nPerhaps the most telling outcome was watching Food Twitter realize it had accidentally become a case study in economic privilege, social media performance, and the strange psychology of food gatekeeping. @PizzaPurist92 later tweeted: \"I just wanted to know how to heat up my lunch. I didn''t mean to start a class war.\"\n\nIn the end, perhaps @FoodEquityNow said it best: \"The best way to reheat pizza is however makes you happy with whatever equipment you have available.\" A perfectly reasonable conclusion that somehow felt revolutionary in the context of a platform that routinely argues about everything.\n\nThe Terry''s final observation: Food Twitter managed to take a simple question about reheating pizza and turn it into a masterclass in how the internet can simultaneously be deeply insightful and absolutely mental. It''s almost impressive how we can extract sociological meaning from melted cheese.\n\nBut let''s be honest - Food Twitter will probably find a way to argue about that conclusion too. Give it a week and someone will tweet about how \"reheating discourse analysis\" is itself a form of cultural elitism. The cycle continues, as it always does, until the next innocent food question triggers the next completely predictable meltdown.\n\nAt least the pizza was eventually eaten. Probably cold, out of pure spite."}]}',
  'Food Wars',
  true,
  0,
  690,
  24,
  '/assets/img/blog/blog07.jpg',
  'published',
  '2025-06-20T10:57:43.000Z',
  '2025-06-20T10:57:43.000Z'
);

INSERT INTO posts (
  title, slug, hook, content, category, featured, trending_score, 
  view_count, share_count, featured_image, status, created_at, updated_at
) VALUES (
  'Local Man Spends $400 on ''Artisanal'' Burger That''s Literally Just McDonald''s in Fancy Packaging',
  'local-man-spends-400-on-artisanal-burger-that-s-literally-ju',
  'Marcus thought he was experiencing ''elevated street food'' until he recognized the exact same sauce packets from his local McDonald''s in the $32 ''artisanal'' burger.',
  '{"sections":[{"type":"describe-1","title":"The Setup","content":"Marcus Chen considers himself pretty food-savvy. He knows the difference between a good burger and a great one, understands why wagyu costs more than regular beef, and can spot a tourist trap from three blocks away.\n\nSo when ''Elevated Street'' opened in his neighborhood promising ''artisanal interpretations of classic American comfort food,'' he figured $32 for their signature burger might actually be worth it.","enhanced":false},{"type":"describe-2","title":"How It All Unfolded","content":"The burger arrived with appropriate fanfare. Artfully plated, perfectly constructed, served on what was definitely not a paper wrapper. Marcus took his first bite and... it was familiar. Too familiar.\n\nThat sauce. That exact combination of flavors. The way the pickles were cut. He''d tasted this exact burger before, but definitely not for $32."},{"type":"quotes","content":"Thirty-two dollars for a McDonald''s Quarter Pounder. I''ve been had by the world''s most expensive drive-through.","metadata":{"attribution":"The moment everything clicked","context":"When reality hit"}},{"type":"discussion","title":"The Bigger Picture","content":"The artisanal food movement has created perfect cover for what amounts to elaborate price gouging. Slap ''elevated'' or ''artisanal'' on anything, and suddenly a 400% markup seems justified.\n\nBut this goes beyond overpriced food. It''s about how marketing language has become so sophisticated that we can be convinced to pay premium prices for the exact same product we could get elsewhere for a fraction of the cost."},{"type":"outro","title":"The Takeaway","content":"Marcus got his money back after posting his discovery online and the story went viral. ''Elevated Street'' quietly disappeared from delivery apps shortly after. The building now houses a legitimate restaurant that doesn''t try to pass off fast food as fine dining."}]}',
  'Food Wars',
  false,
  94,
  2196,
  23,
  '/assets/img/lifestyle/life_style05.jpg',
  'published',
  '2025-06-20T16:20:46.130Z',
  '2025-06-20T17:52:39.704Z'
);

INSERT INTO posts (
  title, slug, hook, content, category, featured, trending_score, 
  view_count, share_count, featured_image, status, created_at, updated_at
) VALUES (
  'Woman Discovers Her Neighbor Has Been Using Her WiFi to Mine Cryptocurrency for Three Years',
  'woman-discovers-her-neighbor-has-been-using-her-wifi-to-mine',
  'Three years of mysteriously high electricity bills finally explained when Sarah discovered her ''helpful'' neighbor Bob had been running a full crypto mining operation off her internet connection.',
  '{"sections":[{"type":"describe-1","title":"The Setup","content":"Sarah Patterson thought she was going crazy. For three years, her electricity bills had been climbing steadily, despite no changes to her usage patterns. No new appliances, no lifestyle changes, just mysteriously increasing costs that made her question everything from her meter to her sanity.\n\nThen she decided to check her WiFi settings.","enhanced":true},{"type":"describe-2","title":"How It All Unfolded","content":"What Sarah found in her router logs changed everything. Unknown devices. Massive data usage during hours when she was asleep. Traffic patterns that looked nothing like her Netflix-and-email lifestyle.\n\nA little detective work revealed the truth: her neighbor Bob, the guy who''d been ''so helpful'' when she moved in three years ago, had somehow gained access to her network. Not just casual browsing access—full-scale cryptocurrency mining operation access."},{"type":"quotes","content":"I trusted this man with my spare key when I went on vacation. He was watering my plants while mining Bitcoin in my basement.","metadata":{"attribution":"The moment everything clicked","context":"When reality hit"}},{"type":"discussion","title":"The Bigger Picture","content":"This isn''t just about WiFi theft—it''s about the erosion of basic trust in an increasingly connected world. When your neighbor can literally profit off your utilities without your knowledge, what does that say about digital privacy and consent?\n\nThe cryptocurrency angle makes it even more insidious. Bob wasn''t just checking email on Sarah''s dime; he was running a business operation that transferred the costs to an unknowing victim."},{"type":"outro","title":"The Takeaway","content":"Sarah changed her WiFi password and filed a police report. Bob moved out the following month, presumably to find new neighbors with better security practices. The electricity bill returned to normal, but the trust in neighborhood relationships? That''s going to take longer to restore."}]}',
  'Tech Drama',
  false,
  100,
  3020,
  34,
  '/assets/img/technology/tech_01.jpg',
  'published',
  '2025-06-20T15:31:14.477Z',
  '2025-06-20T17:52:39.704Z'
);

-- Re-enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Verify migration
SELECT COUNT(*) as total_posts FROM posts;
SELECT title, slug, category FROM posts ORDER BY created_at DESC;
