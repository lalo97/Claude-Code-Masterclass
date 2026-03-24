#!/bin/bash
# .claude/hooks/prettier.sh
#
# This hook runs Prettier automatically after Claude edits a TypeScript file.
# It receives a JSON payload via stdin (from Claude Code) and formats the file
# if it has a .ts or .tsx extension.

# Read the file path from the JSON payload that Claude Code sends via stdin.
# jq parses the JSON and extracts the value at tool_input.file_path.
FILE_PATH=$(jq -r '.tool_input.file_path')

# Check if the file path ends in .ts or .tsx
if [[ "$FILE_PATH" =~ \.tsx?$ ]]; then
  # Run Prettier on the file to auto-format it
  npx prettier --write "$FILE_PATH"
fi
