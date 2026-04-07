# Adversarial Reviewer

A Claude Code skill for conducting harsh-but-constructive adversarial code reviews using Google's Gemini CLI with Gemini 3.1 Pro (or fallback to other models).

## Installation

### Via skills.sh (Recommended)

```bash
npx skills add <repo-url>
```

Or install directly from GitHub:

```bash
npx skills add github:carlosmello/adversarial-reviewer
```

### Manual Installation

```bash
# Clone the repository
git clone <repo-url>

# Install to Claude Code skills directory
claude skills install ./adversarial-reviewer
```

## Prerequisites

1. **Gemini CLI** must be installed:
   ```bash
   npm install -g @google/gemini-cli
   ```

2. **Gemini API key** configured (run `gemini` once to set up)

## What it does

This skill acts as a "red team" reviewer that actively looks for problems rather than being polite. It reviews code, scripts, and documentation for:

- **Security vulnerabilities** (injection, path traversal, race conditions, secrets exposure)
- **Data loss risks** (in-place modifications without backups)
- **Factual inaccuracies** (unverified claims, logical flaws)
- **Edge cases** (concurrency issues, error handling gaps)

## Usage

Once installed, the skill automatically triggers when you request:

- "Review this code for security issues"
- "Do an adversarial review of this script"
- "Security audit this file"
- "Critically analyze this documentation"
- Any mention of "adversarial", "security review", "vulnerability assessment"

### Example prompts

```
Review scripts/linux/optimize.sh for security vulnerabilities
```

```
Do an adversarial review of the docs/configuration.md file
```

```
Security audit this repository - look for race conditions and injection risks
```

```
Critically analyze the README for factual inaccuracies
```

## Output Format

The skill produces structured reports in this format:

```markdown
# Adversarial Review Report
**Scope**: [what was reviewed]
**Reviewer**: Gemini 3.1 Pro (adversarial mode)
**Date**: [date]

## Risk Summary
[Critical count] Critical | [High count] High | [Medium count] Medium | [Low count] Low

## Critical Issues (Must Fix)
| Issue | Location | Evidence | Your Verification |
|-------|----------|----------|-----------------|
| [Description] | [file:line] | [Code snippet] | [Verification status] |

## Improvements (Should Fix)
...

## Suggestions (Nice to Have)
...

## Questions
...

## Top 5 Priority Fixes
1. [Highest priority]
2. ...
```

## How it works

1. **Pre-review analysis**: Claude identifies relevant files and reads key sections
2. **Gemini invocation**: Creates a comprehensive review prompt with file contents
3. **Post-review processing**: Claude verifies claims, filters false positives, and presents results

The skill uses this Gemini command with model fallback priority:
```bash
gemini -m gemini-3.1-pro-preview -p /tmp/adversarial-review-prompt.txt 2>/dev/null || \
gemini -m gemini-2.5-pro -p /tmp/adversarial-review-prompt.txt 2>/dev/null || \
gemini -m gemini-3.0-flash-preview -p /tmp/adversarial-review-prompt.txt 2>/dev/null || \
gemini -m gemini-2.5-flash -p /tmp/adversarial-review-prompt.txt
```

**Model priority** (tries in order):
1. `gemini-3.1-pro-preview` (Gemini 3.1 Pro)
2. `gemini-2.5-pro`
3. `gemini-3.0-flash-preview` (Gemini 3.0 Flash)
4. `gemini-2.5-flash` (fallback)

## Safety checks

Before presenting findings, the skill:
- [x] Verifies security claims with actual code review
- [x] Validates line numbers are accurate
- [x] Distinguishes Gemini's opinion from verifiable fact
- [x] Adds Claude's own analysis (doesn't just parrot Gemini)
- [x] Filters out false positives

## Known limitations

- **Gemini rate limits**: May encounter rate limiting during heavy use
- **Model availability**: Gemini 3.1 Pro may not always be available (fallback to other models)
- **Context limits**: Very large files may need to be chunked
- **Verification needed**: Always verify security claims before acting on them

## Troubleshooting

### "gemini: command not found"
Install the Gemini CLI:
```bash
npm install -g @google/gemini-cli
```

### Rate limit errors
The skill automatically falls back through the model priority list if rate limits are hit.

### Empty or short responses
Gemini may return brief responses for simple files. The skill will ask you if you want to:
- Add more files to the review
- Focus on specific attack vectors
- Try again with a more detailed prompt

## Configuration

No configuration needed. The skill automatically:
- Detects available Gemini models
- Selects appropriate review methodology based on file types
- Adjusts prompt focus based on your request (security vs accuracy vs edge cases)

## License

MIT

## Related

- [Gemini CLI documentation](https://github.com/google/gemini-cli)
- [Claude Code skills documentation](https://docs.anthropic.com/claude-code/skills)
- [skills.sh](https://skills.sh) - Skill registry and installer
