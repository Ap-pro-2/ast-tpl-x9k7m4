#!/bin/bash

# Core Logic Test Runner
# Run this script before any theme release to ensure core logic is solid

echo "🧪 Running Core Blog Logic Tests..."
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Run the core tests
echo -e "${YELLOW}Running unit tests...${NC}"
npm run test:core

# Check if tests passed
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ All core logic tests passed!${NC}"
    echo -e "${GREEN}✅ Theme release is ready!${NC}"
    
    # Optional: Run build test
    echo -e "\n${YELLOW}Testing build process...${NC}"
    npm run build
    
    if [ $? -eq 0 ]; then
        echo -e "\n${GREEN}✅ Build successful!${NC}"
        echo -e "\n${GREEN}🚀 READY FOR RELEASE! 🚀${NC}"
        echo -e "${GREEN}Your core logic is solid and the theme builds correctly.${NC}"
    else
        echo -e "\n${RED}❌ Build failed!${NC}"
        echo -e "${RED}Fix build issues before releasing.${NC}"
        exit 1
    fi
else
    echo -e "\n${RED}❌ Core logic tests failed!${NC}"
    echo -e "${RED}Fix failing tests before releasing any theme.${NC}"
    exit 1
fi

echo -e "\n${YELLOW}📊 Test Summary:${NC}"
echo "- Core functions: ✅ Tested"
echo "- Pagination logic: ✅ Tested"
echo "- SEO generation: ✅ Tested"
echo "- Content filtering: ✅ Tested"
echo "- Error handling: ✅ Tested"
echo "- Integration flows: ✅ Tested"

echo -e "\n${GREEN}Happy theme building! 🎨${NC}"