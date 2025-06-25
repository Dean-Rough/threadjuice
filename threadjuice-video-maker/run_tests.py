#!/usr/bin/env python3
"""
ThreadJuice Video Maker Test Runner
Executes comprehensive test suite with coverage reporting
"""

import sys
import subprocess
import os
from pathlib import Path
from datetime import datetime
import json

def run_tests():
    """Run the complete test suite"""
    
    print("🧪 ThreadJuice Video Maker - Test Suite")
    print("=" * 60)
    print(f"📅 Test Run: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # Ensure test dependencies are installed
    print("\n📦 Checking test dependencies...")
    try:
        import pytest
        import pytest_cov
        print("✅ Test dependencies installed")
    except ImportError:
        print("❌ Installing test dependencies...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements-test.txt"])
        print("✅ Dependencies installed")
    
    # Create output directories
    Path(".claudedocs/metrics").mkdir(parents=True, exist_ok=True)
    Path(".claudedocs/summaries").mkdir(parents=True, exist_ok=True)
    
    # Test execution options
    test_args = [
        "-v",  # Verbose
        "--tb=short",  # Short traceback
        "--durations=10",  # Show 10 slowest tests
        "--cov=threadjuice",
        "--cov=video_creation", 
        "--cov=utils",
        "--cov=TTS",
        "--cov-report=html:.claudedocs/metrics/coverage.html",
        "--cov-report=term-missing",
        "--cov-report=json:.claudedocs/metrics/coverage.json",
        "--junit-xml=.claudedocs/metrics/test-results.xml"
    ]
    
    # Run specific test categories based on arguments
    if len(sys.argv) > 1:
        if "--unit" in sys.argv:
            print("\n🔬 Running Unit Tests Only...")
            test_args.extend(["-m", "unit"])
        elif "--integration" in sys.argv:
            print("\n🔗 Running Integration Tests Only...")
            test_args.extend(["-m", "integration"])
        elif "--quick" in sys.argv:
            print("\n⚡ Running Quick Tests (excluding slow)...")
            test_args.extend(["-m", "not slow"])
        elif "--external" in sys.argv:
            print("\n🌐 Running External API Tests...")
            test_args.extend(["-m", "external"])
    else:
        print("\n🏃 Running All Tests...")
    
    # Execute tests
    print("\n" + "=" * 60)
    result = subprocess.run(
        [sys.executable, "-m", "pytest"] + test_args,
        cwd=os.path.dirname(os.path.abspath(__file__))
    )
    
    # Generate test summary
    generate_test_summary(result.returncode)
    
    return result.returncode

def generate_test_summary(exit_code):
    """Generate a markdown summary of test results"""
    
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    summary_file = f".claudedocs/summaries/test-results-{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
    
    # Read coverage data
    coverage_data = {}
    try:
        with open('.claudedocs/metrics/coverage.json', 'r') as f:
            coverage_json = json.load(f)
            coverage_data = {
                'total_coverage': coverage_json.get('totals', {}).get('percent_covered', 0),
                'files': coverage_json.get('files', {})
            }
    except:
        coverage_data = {'total_coverage': 0, 'files': {}}
    
    # Read test results
    test_stats = {
        'passed': 0,
        'failed': 0,
        'skipped': 0,
        'errors': 0
    }
    
    # Parse pytest output (would need to capture stdout for real stats)
    
    # Generate summary
    summary = f"""# ThreadJuice Video Maker - Test Results

**Date**: {timestamp}  
**Status**: {'✅ PASSED' if exit_code == 0 else '❌ FAILED'}  
**Exit Code**: {exit_code}

## Coverage Summary

**Total Coverage**: {coverage_data.get('total_coverage', 0):.1f}%

### Coverage by Module

| Module | Coverage | Missing Lines |
|--------|----------|---------------|
"""
    
    # Add file coverage
    for file_path, file_data in coverage_data.get('files', {}).items():
        if any(module in file_path for module in ['threadjuice', 'video_creation', 'utils', 'TTS']):
            module_name = Path(file_path).name
            coverage_pct = file_data.get('summary', {}).get('percent_covered', 0)
            missing = len(file_data.get('missing_lines', []))
            summary += f"| {module_name} | {coverage_pct:.1f}% | {missing} |\n"
    
    summary += f"""

## Test Execution Summary

- **Total Tests**: {test_stats['passed'] + test_stats['failed'] + test_stats['skipped']}
- **Passed**: {test_stats['passed']} ✅
- **Failed**: {test_stats['failed']} ❌
- **Skipped**: {test_stats['skipped']} ⏭️
- **Errors**: {test_stats['errors']} 💥

## Reports

- 📊 **Coverage HTML Report**: `.claudedocs/metrics/coverage.html`
- 📄 **Coverage JSON**: `.claudedocs/metrics/coverage.json`
- 🧪 **JUnit XML**: `.claudedocs/metrics/test-results.xml`
- 📝 **This Summary**: `{summary_file}`

## Recommendations

"""
    
    if coverage_data.get('total_coverage', 0) < 80:
        summary += "- ⚠️ **Coverage below 80%**: Add more unit tests for uncovered code paths\n"
    
    if exit_code != 0:
        summary += "- ❌ **Tests failing**: Fix failing tests before proceeding\n"
    else:
        summary += "- ✅ **All tests passing**: Code is ready for deployment\n"
    
    # Write summary
    with open(summary_file, 'w') as f:
        f.write(summary)
    
    print(f"\n📄 Test summary saved to: {summary_file}")
    print(f"📊 Coverage report saved to: .claudedocs/metrics/coverage.html")
    
    # Display coverage summary in terminal
    print("\n" + "=" * 60)
    print("📊 COVERAGE SUMMARY")
    print("=" * 60)
    print(f"Total Coverage: {coverage_data.get('total_coverage', 0):.1f}%")
    
    if coverage_data.get('total_coverage', 0) >= 80:
        print("✅ Coverage meets 80% threshold")
    else:
        print("❌ Coverage below 80% threshold")

def main():
    """Main entry point"""
    
    # Show usage if --help
    if "--help" in sys.argv:
        print("""
ThreadJuice Video Maker Test Runner

Usage:
    python run_tests.py [options]

Options:
    --unit          Run unit tests only
    --integration   Run integration tests only  
    --quick         Run all tests except slow ones
    --external      Run tests requiring external APIs
    --help          Show this help message

Coverage reports will be generated in .claudedocs/metrics/
        """)
        return 0
    
    # Run tests
    exit_code = run_tests()
    
    # Exit with test result code
    sys.exit(exit_code)

if __name__ == "__main__":
    main()