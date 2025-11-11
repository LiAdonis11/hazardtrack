#!/usr/bin/env bash

# EAS Build Pre-Install Hook
# This script runs before dependencies are installed

set -e

echo "🔧 Running pre-install setup..."

# Set environment variables
export NODE_ENV=production
export EXPO_PUBLIC_TAMAGUI_TARGET=native

echo "✅ Environment variables set"
echo "   NODE_ENV=$NODE_ENV"
echo "   EXPO_PUBLIC_TAMAGUI_TARGET=$EXPO_PUBLIC_TAMAGUI_TARGET"

# Clean any existing build artifacts
if [ -d "android/app/.cxx" ]; then
    echo "🧹 Cleaning .cxx directory..."
    rm -rf android/app/.cxx
fi

if [ -d "android/.gradle" ]; then
    echo "🧹 Cleaning .gradle directory..."
    rm -rf android/.gradle
fi

if [ -d "android/build" ]; then
    echo "🧹 Cleaning android/build directory..."
    rm -rf android/build
fi

if [ -d "android/app/build" ]; then
    echo "🧹 Cleaning android/app/build directory..."
    rm -rf android/app/build
fi

echo "✅ Pre-install setup complete"

