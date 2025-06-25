# ThreadJuice Migration Steps

## Step 1: Temporarily Disable RLS

Run this in Supabase SQL Editor:

```sql
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
```

## Step 2: Run Migration

```bash
node migrate-to-supabase.js
```

## Step 3: Re-enable RLS

Run this in Supabase SQL Editor:

```sql
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
```

## Step 4: Switch to Production API

```bash
mv src/app/api/posts/route.ts src/app/api/posts/route-old.ts
mv src/app/api/posts/route-supabase.ts src/app/api/posts/route.ts
```

## Step 5: Test

```bash
curl http://localhost:4242/api/posts | jq '.meta.source'
# Should return "supabase"
```

The RLS needs to be temporarily disabled because our anon key doesn't have insert permissions for posts table with RLS enabled.
