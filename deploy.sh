#!/bin/bash
# Deploy script for GitHub Pages

echo "Building Next.js site..."
npm run build

echo "Deploying to GitHub Pages..."
git checkout gh-pages 2>/dev/null || git checkout --orphan gh-pages

# Remove old files (but keep .git)
git rm -rf . 2>/dev/null || true
rm -rf * 2>/dev/null || true

# Copy new build
cp -r out/* .
cp out/.nojekyll .

# Commit and push
git add .
git commit -m "Deploy: $(date +'%Y-%m-%d %H:%M:%S')"
git push origin gh-pages --force

# Return to main
git checkout main

echo "Deployment complete!"
echo "Visit: https://stevechoi0222.github.io/ai-cralwer-tracker/"
