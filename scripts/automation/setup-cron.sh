#!/bin/bash

# ThreadJuice Automation Setup Script
# Sets up cron jobs for automated content generation

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
CRON_SCRIPT="$SCRIPT_DIR/cron-content-generator.js"
LOG_DIR="$PROJECT_DIR/logs/automation"
NODE_PATH="$(which node)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🤖 ThreadJuice Automation Setup${NC}"
echo "=================================="

# Check if node is available
if [ ! -x "$NODE_PATH" ]; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js found: $NODE_PATH${NC}"

# Check if the script exists
if [ ! -f "$CRON_SCRIPT" ]; then
    echo -e "${RED}❌ Cron script not found: $CRON_SCRIPT${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Cron script found: $CRON_SCRIPT${NC}"

# Create log directory
mkdir -p "$LOG_DIR"
echo -e "${GREEN}✅ Log directory: $LOG_DIR${NC}"

# Make script executable
chmod +x "$CRON_SCRIPT"

# Function to add cron job
add_cron_job() {
    local schedule="$1"
    local description="$2"
    local args="$3"
    local log_file="$LOG_DIR/threadjuice-$(echo "$description" | tr ' ' '-' | tr '[:upper:]' '[:lower:]').log"
    
    # Create the cron command
    local cron_command="cd $PROJECT_DIR && $NODE_PATH $CRON_SCRIPT $args >> $log_file 2>&1"
    local cron_line="$schedule $cron_command"
    
    echo -e "\n${YELLOW}📅 Setting up: $description${NC}"
    echo "   Schedule: $schedule"
    echo "   Command: $cron_command"
    echo "   Log file: $log_file"
    
    # Check if cron job already exists
    if crontab -l 2>/dev/null | grep -q "$CRON_SCRIPT.*$args"; then
        echo -e "${YELLOW}⚠️  Cron job already exists, skipping...${NC}"
        return
    fi
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "$cron_line") | crontab -
    echo -e "${GREEN}✅ Added cron job${NC}"
}

# Function to show menu
show_menu() {
    echo -e "\n${BLUE}📋 Choose automation schedule:${NC}"
    echo "1) Hourly (every hour)"
    echo "2) Daily (9 AM)"
    echo "3) Twice daily (9 AM and 6 PM)"
    echo "4) Custom schedule"
    echo "5) Test run (dry-run)"
    echo "6) Remove all automation"
    echo "7) Show current cron jobs"
    echo "8) Exit"
}

# Function to remove all ThreadJuice cron jobs
remove_all_jobs() {
    echo -e "\n${YELLOW}🗑️  Removing all ThreadJuice automation...${NC}"
    
    # Remove cron jobs containing our script
    crontab -l 2>/dev/null | grep -v "$CRON_SCRIPT" | crontab - 2>/dev/null || true
    
    echo -e "${GREEN}✅ All ThreadJuice automation removed${NC}"
}

# Function to show current cron jobs
show_current_jobs() {
    echo -e "\n${BLUE}📋 Current ThreadJuice cron jobs:${NC}"
    
    if crontab -l 2>/dev/null | grep -q "$CRON_SCRIPT"; then
        crontab -l 2>/dev/null | grep "$CRON_SCRIPT" | while read -r line; do
            echo "   $line"
        done
    else
        echo -e "${YELLOW}⚠️  No ThreadJuice automation found${NC}"
    fi
}

# Function to test the script
test_script() {
    echo -e "\n${BLUE}🧪 Testing automation script...${NC}"
    
    echo "Running dry-run with verbose output:"
    cd "$PROJECT_DIR"
    "$NODE_PATH" "$CRON_SCRIPT" --dry-run --verbose --count 3
    
    echo -e "\n${GREEN}✅ Test completed${NC}"
}

# Main menu loop
while true; do
    show_menu
    echo -n "Enter choice [1-8]: "
    read -r choice
    
    case $choice in
        1)
            echo -e "\n${GREEN}⏰ Setting up hourly automation...${NC}"
            add_cron_job "0 * * * *" "Hourly Content Generation" "--count 3 --source reddit"
            ;;
        2)
            echo -e "\n${GREEN}🌅 Setting up daily automation (9 AM)...${NC}"
            add_cron_job "0 9 * * *" "Daily Content Generation" "--count 5 --source reddit"
            ;;
        3)
            echo -e "\n${GREEN}🌅🌆 Setting up twice-daily automation...${NC}"
            add_cron_job "0 9 * * *" "Morning Content Generation" "--count 5 --source reddit"
            add_cron_job "0 18 * * *" "Evening Content Generation" "--count 3 --source reddit"
            ;;
        4)
            echo -e "\n${BLUE}📝 Custom schedule setup:${NC}"
            echo "Enter cron schedule (e.g., '0 */6 * * *' for every 6 hours):"
            read -r custom_schedule
            echo "Enter story count (1-20):"
            read -r story_count
            echo "Enter source (reddit/twitter):"
            read -r source
            
            if [[ "$custom_schedule" =~ ^[0-9*/ ,-]+$ ]] && [[ "$story_count" =~ ^[0-9]+$ ]] && [[ "$source" =~ ^(reddit|twitter)$ ]]; then
                add_cron_job "$custom_schedule" "Custom Content Generation" "--count $story_count --source $source"
            else
                echo -e "${RED}❌ Invalid input. Please try again.${NC}"
            fi
            ;;
        5)
            test_script
            ;;
        6)
            remove_all_jobs
            ;;
        7)
            show_current_jobs
            ;;
        8)
            echo -e "\n${BLUE}👋 Goodbye!${NC}"
            break
            ;;
        *)
            echo -e "${RED}❌ Invalid choice. Please enter 1-8.${NC}"
            ;;
    esac
    
    if [ "$choice" != "8" ]; then
        echo -e "\nPress Enter to continue..."
        read -r
    fi
done

echo -e "\n${GREEN}✅ Setup complete!${NC}"
echo -e "\n${BLUE}📋 Next steps:${NC}"
echo "1. Check logs in: $LOG_DIR"
echo "2. Monitor automation: crontab -l"
echo "3. View logs: tail -f $LOG_DIR/*.log"
echo "4. Admin dashboard: http://localhost:3000/admin/automation"

echo -e "\n${YELLOW}💡 Useful commands:${NC}"
echo "• View all cron jobs: crontab -l"
echo "• Edit cron jobs: crontab -e"
echo "• Test script manually: cd $PROJECT_DIR && node $CRON_SCRIPT --dry-run"
echo "• Check logs: ls -la $LOG_DIR"