#!/bin/bash

# ThreadJuice Auto Generation Startup Script
# Generates 5 stories per day indefinitely

echo "🚀 Starting ThreadJuice Auto Generation"
echo "Configuration: 5 stories per day"
echo ""

# Calculate interval for 5 stories per day
# 24 hours = 1440 minutes
# 1440 / 5 = 288 minutes between each story

node scripts/automation/continuous-generator.js \
  --count 1 \
  --interval 288 \
  --max-daily 5 \
  --source reddit

# The script will run indefinitely until stopped with:
# node scripts/automation/continuous-generator.js --stop