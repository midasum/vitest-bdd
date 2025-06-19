#!/bin/bash

set -e

DATE=$(date +'%Y%m%dT%H%M%S')

# Set up environment
if ! command -v pnpm &>/dev/null; then
  echo "pnpm is not installed. Please install it first."
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "Error: There are uncommitted changes in the repository."
  echo "Please commit or stash your changes before proceeding."
  exit 1
else
  echo "Repository is clean. Proceeding with the operation."
fi

is_semver() {
  local version="$1"
  # Regex for SemVer compliance
  if [[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*)?(\+[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*)?$ ]]; then
    echo "Valid SemVer: $version"
    return 0
  else
    echo "Invalid SemVer: $version"
    return 1
  fi
}

# Install dependencies
pnpm i
# Rebuild for all projects
pnpm build
# Copy README.md
cp README.md vitest-bdd/README.md

cd vitest-bdd
LIB_VERSION=$(npm pkg get version | sed 's/"//g')
is_semver "$LIB_VERSION"

LIB_VERSION=$LIB_VERSION-canary.$DATE
npm --no-git-tag-version version $LIB_VERSION
CANARY=true pnpm publish --tag canary --access public --no-git-checks

cd ..

# Reset git repo
git reset --hard HEAD

echo "Canary version published successfully!"
