#!/bin/bash

# ThreadJuice Continuous Generator Startup Script
# Easy way to start/stop/monitor the continuous content generator

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
GENERATOR_SCRIPT="$SCRIPT_DIR/continuous-generator.js"
LOG_DIR="$PROJECT_DIR/logs/automation"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🤖 ThreadJuice Continuous Generator Control${NC}"
echo "=============================================="

# Create log directory
mkdir -p "$LOG_DIR"

show_status() {
    echo -e "\n${BLUE}📊 Current Status:${NC}"
    
    if [ -f "$PROJECT_DIR/.continuous-generator.pid" ]; then
        local pid=$(cat "$PROJECT_DIR/.continuous-generator.pid" 2>/dev/null || echo "")
        if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
            echo -e "${GREEN}✅ Running (PID: $pid)${NC}"
            
            # Show statistics if state file exists
            if [ -f "$PROJECT_DIR/.continuous-generator-state.json" ]; then
                echo -e "\n${BLUE}📈 Statistics:${NC}"
                
                # Parse JSON (basic parsing, assumes simple structure)
                local total_runs=$(grep '"totalRuns"' "$PROJECT_DIR/.continuous-generator-state.json" | sed 's/.*: *\([0-9]*\).*/\1/')
                local total_successful=$(grep '"totalSuccessful"' "$PROJECT_DIR/.continuous-generator-state.json" | sed 's/.*: *\([0-9]*\).*/\1/')
                local total_stories=$(grep '"totalStories"' "$PROJECT_DIR/.continuous-generator-state.json" | sed 's/.*: *\([0-9]*\).*/\1/')
                local daily_count=$(grep '"dailyCount"' "$PROJECT_DIR/.continuous-generator-state.json" | sed 's/.*: *\([0-9]*\).*/\1/')
                
                echo "   • Total runs: ${total_runs:-0}"
                echo "   • Stories today: ${daily_count:-0}"
                echo "   • Total successful: ${total_successful:-0}/${total_stories:-0}"
                
                if [ -n "$total_stories" ] && [ "$total_stories" -gt 0 ]; then
                    local success_rate=$((total_successful * 100 / total_stories))
                    echo "   • Success rate: ${success_rate}%"
                fi
            fi
            
            # Show process info
            echo -e "\n${BLUE}🔍 Process Info:${NC}"
            ps -p "$pid" -o pid,ppid,start,time,command 2>/dev/null || echo "Process details unavailable"
            
        else
            echo -e "${RED}❌ Not running (stale PID file)${NC}"
            rm -f "$PROJECT_DIR/.continuous-generator.pid"
        fi
    else
        echo -e "${YELLOW}⭕ Not running${NC}"
    fi
}

show_logs() {
    local log_file="$LOG_DIR/continuous-generator.log"
    
    echo -e "\n${BLUE}📋 Recent Logs:${NC}"
    
    if [ -f "$log_file" ]; then
        echo "Showing last 20 lines from: $log_file"
        echo "---"
        tail -n 20 "$log_file"
        echo "---"
        echo -e "\n${YELLOW}💡 To follow logs in real-time: tail -f $log_file${NC}"
    else
        echo "No log file found yet: $log_file"
    fi
}

start_generator() {
    local count="${1:-3}"
    local source="${2:-reddit}"
    local interval="${3:-60}"
    
    echo -e "\n${GREEN}🚀 Starting continuous generator...${NC}"
    echo "Configuration:"
    echo "   • Stories per hour: $count"
    echo "   • Source: $source"
    echo "   • Interval: $interval minutes"
    echo "   • Max daily: 50 stories"
    
    # Start in background
    cd "$PROJECT_DIR"
    nohup node "$GENERATOR_SCRIPT" \
        --count "$count" \
        --source "$source" \
        --interval "$interval" \
        > "$LOG_DIR/continuous-generator-startup.log" 2>&1 &
    
    # Wait a moment to check if it started successfully
    sleep 2
    
    if [ -f "$PROJECT_DIR/.continuous-generator.pid" ]; then
        local pid=$(cat "$PROJECT_DIR/.continuous-generator.pid")
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "${GREEN}✅ Started successfully (PID: $pid)${NC}"
            echo -e "\n${BLUE}📋 Management commands:${NC}"
            echo "   • Status: $0 status"
            echo "   • Logs: $0 logs"
            echo "   • Stop: $0 stop"
        else
            echo -e "${RED}❌ Failed to start${NC}"
            echo "Check startup log: $LOG_DIR/continuous-generator-startup.log"
        fi
    else
        echo -e "${RED}❌ Failed to start (no PID file created)${NC}"
        echo "Check startup log: $LOG_DIR/continuous-generator-startup.log"
    fi
}

stop_generator() {
    echo -e "\n${YELLOW}🛑 Stopping continuous generator...${NC}"
    
    cd "$PROJECT_DIR"
    node "$GENERATOR_SCRIPT" --stop
}

show_menu() {
    echo -e "\n${BLUE}📋 Available commands:${NC}"
    echo "1) start [count] [source] [interval] - Start continuous generation"
    echo "2) stop                              - Stop continuous generation"
    echo "3) status                           - Show current status"
    echo "4) logs                             - Show recent logs"
    echo "5) restart [count] [source]         - Restart with new settings"
    echo "6) exit                             - Exit this menu"
    echo ""
    echo "Examples:"
    echo "   $0 start 5 reddit 30    # 5 stories every 30 minutes from Reddit"
    echo "   $0 start 2 twitter 120  # 2 stories every 2 hours from Twitter"
    echo "   $0 status               # Check if running"
    echo "   $0 logs                 # View recent activity"
}

# Handle command line arguments
case "${1:-menu}" in
    "start")
        start_generator "$2" "$3" "$4"
        ;;
    "stop")
        stop_generator
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "restart")
        stop_generator
        sleep 3
        start_generator "$2" "$3" "$4"
        ;;
    "menu"|"")
        while true; do
            show_status
            show_menu
            echo -n "Choose option [1-6]: "
            read -r choice
            
            case $choice in
                1)
                    echo -n "Stories per hour [3]: "
                    read -r count
                    count=${count:-3}
                    
                    echo -n "Source (reddit/twitter) [reddit]: "
                    read -r source
                    source=${source:-reddit}
                    
                    echo -n "Interval in minutes [60]: "
                    read -r interval
                    interval=${interval:-60}
                    
                    start_generator "$count" "$source" "$interval"
                    ;;
                2)
                    stop_generator
                    ;;
                3)
                    show_status
                    ;;
                4)
                    show_logs
                    ;;
                5)
                    echo -n "Stories per hour [3]: "
                    read -r count
                    count=${count:-3}
                    
                    echo -n "Source (reddit/twitter) [reddit]: "
                    read -r source
                    source=${source:-reddit}
                    
                    stop_generator
                    sleep 3
                    start_generator "$count" "$source"
                    ;;
                6)
                    echo -e "\n${BLUE}👋 Goodbye!${NC}"
                    break
                    ;;
                *)
                    echo -e "${RED}❌ Invalid option${NC}"
                    ;;
            esac
            
            if [ "$choice" != "6" ]; then
                echo -e "\nPress Enter to continue..."
                read -r
            fi
        done
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo ""
        echo "Usage: $0 {start|stop|status|logs|restart|menu}"
        echo "   or: $0 start [count] [source] [interval]"
        echo ""
        echo "Examples:"
        echo "   $0 start 3 reddit 60    # 3 stories every hour from Reddit"
        echo "   $0 stop                 # Stop the generator"
        echo "   $0 status               # Check status"
        exit 1
        ;;
esac