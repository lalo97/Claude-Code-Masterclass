---
description: Analyze the current git diff and generate a concise, conventional commit message.
allowed-tools: Bash(git status:*), Bash(git diff --staged), Bash(git commit:*)
---

## Your task:
Analyze above staged git changes and create a commit message. Use present tense and explain "why" something has changed, not just "what" has changed. 

## Commands to Execute
1. First, `git diff --staged` to see staged changes. If nothing is staged, run `git diff HEAD` to see all unstaged changes.
2. Next, Analyze what changed: files modified, logic added/removed, purpose of the changes.
3. Output a commit message following the Conventional Commits format:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `style:` for formatting/style changes with no logic change
   - `refactor:` for code restructuring without feature changes
   - `test:` for adding or updating tests
   - `docs:` for documentation changes
   - `perf:` for performance changes
   - `chore:` for build process, tooling, or config changes
4. Ask for confirmation before committing.

## Commit types with emojis:
- ✨ `feat:`
- 🐛 `fix:`
- 🎨 `style:`
- 🔨 `refactor:`
- ✅ `test:`
- 📝 `docs:`
- ⚡ `perf:`
- ⚙️ `chore:`


The message should:
- Be under 72 characters for the subject line
- Use the imperative mood ("add", "fix", "update" — not "added" or "fixes")
- Clearly describe *what* changed and *why*
- Follow this format:
    ```
    <emoji> <type>: <concise_description>
    <optional_body_explaining_why>
    ```

Only output the commit message itself — no explanation, no markdown code block, just the raw message text.

DO NOT auto-commit - wait for user approval, and only commit if the user says so.