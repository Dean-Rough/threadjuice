#!/bin/bash

echo "🧪 Testing ThreadJuice Content Automation API..."
echo

# Test starting content ingestion
echo "📡 Starting content ingestion job..."
response=$(curl -s -X POST http://localhost:3000/api/ingest/reddit \
  -H "Content-Type: application/json" \
  -d '{
    "subreddits": ["AmItheAsshole"],
    "limit_per_subreddit": 2,
    "min_viral_score": 5,
    "auto_publish": false
  }')

echo "Response: $response"
echo

# Extract job ID from response
job_id=$(echo $response | grep -o '"job_id":"[^"]*"' | cut -d'"' -f4)

if [ -n "$job_id" ]; then
  echo "✅ Job started with ID: $job_id"
  echo
  
  # Monitor job status
  echo "📊 Monitoring job progress..."
  for i in {1..10}; do
    echo "Checking status (attempt $i)..."
    status_response=$(curl -s http://localhost:3000/api/ingest/status/$job_id)
    echo "Status: $status_response"
    echo
    
    # Check if job is completed
    if echo "$status_response" | grep -q '"status":"completed"'; then
      echo "🎉 Job completed successfully!"
      break
    elif echo "$status_response" | grep -q '"status":"failed"'; then
      echo "❌ Job failed!"
      break
    fi
    
    sleep 10
  done
else
  echo "❌ Failed to start job"
fi

echo "🔚 API test completed"