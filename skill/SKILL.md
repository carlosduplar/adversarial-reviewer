---
name: adversarial-reviewer
description: Use Gemini 3.1 Pro as an adversarial code reviewer to find security vulnerabilities, factual inaccuracies, edge cases, and improvement opportunities. Trigger this skill when the user asks for code review, security audit, critical analysis, adversarial feedback, or when reviewing any repository, codebase, documentation, or scripts. Make sure to use this skill whenever the user mentions security review, vulnerability assessment, critical analysis, finding weaknesses, or adversarial feedback on code or documentation.
---

# Adversarial Reviewer

A skill for conducting harsh-but-constructive adversarial reviews using Gemini 3.1 Pro. This skill acts as a "red team" reviewer that actively looks for problems rather than being polite.

## When to Use

Use this skill when you need:
- Security vulnerability assessment
- Critical code review (finding what's wrong, not what's right)
- Documentation accuracy verification
- Edge case analysis
- Risk identification in scripts or tools
- Factual accuracy checking
- "Red team" analysis of any work product

## Prerequisites

- Gemini CLI must be installed: `npm install -g @google/gemini-cli`
- `gemini` command available in PATH
- Model priority (tries in order): `gemini-pro-latest` → `gemini-2.5-pro` → `gemini-flash-latest` → `gemini-2.5-flash`

## Model Selection

The skill tries models in this priority order until one succeeds:

1. **gemini-pro-latest** (Gemini 3.1 Pro alias)
2. **gemini-2.5-pro**
3. **gemini-flash-latest** (Gemini 3.0 Flash alias)
4. **gemini-2.5-flash** (fallback)

Use this Bash pattern to try each model:

```bash
# Try models in priority order
for model in gemini-pro-latest gemini-2.5-pro gemini-flash-latest gemini-2.5-flash; do
  if output=$(gemini -m "$model" -p /tmp/adversarial-review-prompt.txt 2>&1); then
    echo "$output"
    break
  fi
done
```

## Review Methodology

### 1. Pre-Review Analysis

Before invoking Gemini, gather context:
1. Identify files to review (use Glob/Grep to find relevant code)
2. Read key files to understand the scope
3. Note file paths, line numbers, and specific code sections

### 2. Gemini Invocation

Create a comprehensive review prompt and pipe to Gemini:

```bash
# Create review prompt with file contents
cat > /tmp/adversarial-review-prompt.txt << 'PROMPT'
You are an adversarial security-focused code reviewer. Review the following for:

**CRITICAL ISSUES (must fix):**
- Security vulnerabilities (injection, path traversal, secrets exposure, race conditions)
- Data loss risks
- Legal/compliance issues
- Factual inaccuracies

**IMPROVEMENTS (should fix):**
- Error handling gaps
- Edge cases not covered
- Maintainability issues
- Performance problems

**SUGGESTIONS (nice to have):**
- Code organization
- Documentation clarity
- User experience improvements

**QUESTIONS (need clarification):**
- Ambiguous logic
- Unverified claims
- Missing context

Be harsh but constructive. Cite specific line numbers. Don't hold back.

---
[File paths and contents here]
---

Provide output in this exact structure:

## Executive Summary
[Overall risk level: CRITICAL / HIGH / MEDIUM / LOW]

## Critical Issues (Fix Immediately)
| # | Issue | Location | Risk |
|---|-------|----------|------|
| 1 | [Description] | [file:line] | [Impact] |

## Improvements (Should Fix)
| # | Issue | Location | Recommendation |
|---|-------|----------|----------------|
| 1 | [Description] | [file:line] | [Fix approach] |

## Suggestions (Nice to Have)
- [List of suggestions]

## Questions
- [Clarification needed]

## Top 5 Priority Fixes
1. [Highest priority]
2. ...
PROMPT

# Run Gemini with model fallback priority
gemini -m gemini-pro-latest -p /tmp/adversarial-review-prompt.txt 2>/dev/null || \
gemini -m gemini-2.5-pro -p /tmp/adversarial-review-prompt.txt 2>/dev/null || \
gemini -m gemini-flash-latest -p /tmp/adversarial-review-prompt.txt 2>/dev/null || \
gemini -m gemini-2.5-flash -p /tmp/adversarial-review-prompt.txt
```

### 3. Post-Review Processing

After receiving Gemini's output:
1. Verify any claims about your codebase (don't trust blindly)
2. Filter out false positives
3. Prioritize findings by actual risk
4. Present results with your own analysis added

## Review Categories

### For Code/Scripts:
- **Security**: Injection, path traversal, command execution, secrets handling, temp files, race conditions
- **Reliability**: Error handling, edge cases, resource cleanup, signal handling
- **Correctness**: Logic errors, off-by-one, boundary conditions, type safety
- **Maintainability**: Complexity, coupling, naming, documentation

### For Documentation:
- **Accuracy**: Factual claims, outdated information, unverified assertions
- **Completeness**: Missing steps, assumed knowledge, edge cases
- **Legal**: Copyright, TOS references, compliance claims
- **Clarity**: Ambiguous instructions, undefined terms

### For Configuration/Scripts:
- **Safety**: In-place modifications without backups, destructive operations
- **Permissions**: Overly broad access, privilege escalation risks
- **Validation**: Missing input validation, trust of external data
- **Idempotency**: Re-run safety, state management

## Output Format

Present findings in this structure:

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

## Improvements (Should Fix)
...

## Suggestions (Nice to Have)
...

## Questions
...

## Top 5 Priority Fixes
1. **[Category]**: [Brief description] @ [location]
...
```

## Safety Checks

**Before presenting findings:**
- [ ] Did I verify security claims with actual code review?
- [ ] Are line numbers accurate?
- [ ] Did I distinguish Gemini's opinion vs verifiable fact?
- [ ] Did I add my own analysis, not just parrot Gemini?
- [ ] Are false positives filtered out?

**Red flags to double-check:**
- Claims about "vulnerabilities" that are actually design choices
- Legal advice (disclaim appropriately)
- HIPAA/compliance claims without verification
- Performance claims without measurement

## Example Usage

**User request**: "Review this repository for security issues"

**Your process**:
1. Use Glob to find script files: `**/*.sh`, `**/*.ps1`
2. Read key files (optimization scripts, validation scripts)
3. Create adversarial prompt with file contents
4. Run Gemini: `gemini -m gemini-3.1-pro -p /tmp/prompt.txt`
5. Process output and present structured findings
6. Add your own verification and analysis

## Remember

- **Adversarial != Accurate**: Gemini may find false positives. Always verify.
- **Cite evidence**: Line numbers, code snippets, specific file paths
- **Prioritize**: Not all issues are equal - distinguish must-fix from nice-to-have
- **Constructive criticism**: Frame harsh feedback as improvement opportunities
- **Your judgment matters**: Don't let Gemini override your analysis of the codebase

## Tools

This skill uses: Bash (for Gemini CLI), Glob, Grep, Read
