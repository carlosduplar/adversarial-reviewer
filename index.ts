import { Bash, Glob, Grep, Read } from "@anthropic-ai/claude-code";

/**
 * Adversarial Reviewer Skill
 *
 * Uses Gemini 3.1 Pro as an adversarial code reviewer to find security
 * vulnerabilities, factual inaccuracies, edge cases, and improvement opportunities.
 */

interface ReviewFile {
  path: string;
  content: string;
}

const MODEL_PRIORITY = [
  "gemini-3.1-pro-preview",  // Gemini 3.1 Pro
  "gemini-2.5-pro",
  "gemini-3.0-flash-preview", // Gemini 3.0 Flash
  "gemini-2.5-flash",          // Fallback
];

/**
 * Main entry point for the adversarial reviewer skill
 */
export async function run(request: string): Promise<string> {
  // Step 1: Identify files to review from the request
  const filesToReview = await identifyFiles(request);

  if (filesToReview.length === 0) {
    return `No files specified for review. Please provide file paths or patterns to review.

Examples:
- "Review src/auth.js for security issues"
- "Do an adversarial review of docs/api.md"
- "Security audit the scripts/ directory"`;
  }

  // Step 2: Read file contents
  const fileContents: ReviewFile[] = [];
  for (const filePath of filesToReview) {
    try {
      const content = await Read({ file_path: filePath });
      fileContents.push({ path: filePath, content });
    } catch (error) {
      console.error(`Failed to read ${filePath}: ${error}`);
    }
  }

  if (fileContents.length === 0) {
    return "Could not read any of the specified files. Please check the paths and try again.";
  }

  // Step 3: Build the review prompt
  const reviewPrompt = buildReviewPrompt(request, fileContents);

  // Step 4: Run Gemini with model fallback
  const review = await runGeminiReview(reviewPrompt);

  // Step 5: Format and return the result
  return formatReviewReport(request, review, fileContents);
}

/**
 * Identify files to review from the user request
 */
async function identifyFiles(request: string): Promise<string[]> {
  const files: string[] = [];

  // Check for explicit file paths in the request
  const fileMatches = request.match(/(?:[\w-]+\/)*[\w-]+\.(?:js|ts|py|sh|ps1|md|json|yaml|yml|go|rs|java|cpp|c|h)/gi);
  if (fileMatches) {
    files.push(...fileMatches);
  }

  // Check for directory patterns
  const dirMatches = request.match(/(\w+\/)+/g);
  if (dirMatches && !files.length) {
    for (const dir of dirMatches) {
      const globPattern = `${dir}**/*.{js,ts,py,sh,ps1,md,json,yaml,yml,go,rs,java,cpp,c,h}`;
      const foundFiles = await Glob({ pattern: globPattern });
      files.push(...foundFiles.slice(0, 10)); // Limit to 10 files
    }
  }

  // Default: find common source files if no specific files mentioned
  if (files.length === 0 && (request.includes("repo") || request.includes("repository") || request.includes("this code"))) {
    const commonFiles = await Glob({ pattern: "**/*.{js,ts,py,sh,md}" });
    files.push(...commonFiles.slice(0, 5));
  }

  return [...new Set(files)]; // Deduplicate
}

/**
 * Build the review prompt for Gemini
 */
function buildReviewPrompt(request: string, files: ReviewFile[]): string {
  const fileSection = files.map(f =>
    `---\nFile: ${f.path}\n---\n${f.content}\n`
  ).join("\n");

  return `You are an adversarial security-focused code reviewer. Review the following for:

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

Original request: ${request}

${fileSection}

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
2. ...`;
}

/**
 * Run Gemini review with model fallback
 */
async function runGeminiReview(prompt: string): Promise<string> {
  // Write prompt to temp file
  const tempFile = `/tmp/adversarial-review-prompt-${Date.now()}.txt`;

  try {
    // Create temp file with prompt
    await Bash({
      command: `cat > ${tempFile} << 'PROMPT_EOF'\n${prompt}\nPROMPT_EOF`,
      description: "Create temporary prompt file for Gemini"
    });

    // Try each model in priority order
    for (const model of MODEL_PRIORITY) {
      try {
        const result = await Bash({
          command: `gemini -m "${model}" -p "${tempFile}" 2>&1`,
          description: `Run Gemini review with model ${model}`
        });

        // Check if result looks like a valid response (not an error)
        if (!result.includes("error") && !result.includes("Error") && result.length > 100) {
          return result;
        }
      } catch {
        // Continue to next model
        continue;
      }
    }

    // If all models fail, try one more time with flash as final fallback
    const finalResult = await Bash({
      command: `gemini -m gemini-2.5-flash -p "${tempFile}" 2>/dev/null || echo "Gemini CLI not available or all models failed. Please ensure Gemini CLI is installed: npm install -g @google/gemini-cli"`,
      description: "Final fallback Gemini attempt"
    });

    return finalResult;
  } finally {
    // Cleanup temp file
    await Bash({
      command: `rm -f ${tempFile}`,
      description: "Clean up temporary prompt file"
    }).catch(() => {});
  }
}

/**
 * Format the review report
 */
function formatReviewReport(request: string, geminiOutput: string, files: ReviewFile[]): string {
  const timestamp = new Date().toISOString().split("T")[0];
  const scope = files.map(f => f.path).join(", ");

  return `# Adversarial Review Report
**Scope**: ${scope}
**Reviewer**: Gemini 3.1 Pro (adversarial mode)
**Date**: ${timestamp}
**Request**: ${request}

---

${geminiOutput}

---

## Verification Checklist
Before acting on these findings:
- [ ] Verify security claims with actual code review
- [ ] Check that line numbers are accurate
- [ ] Distinguish Gemini's opinion from verifiable fact
- [ ] Filter out false positives
- [ ] Prioritize by actual risk to your use case

**Remember**: Adversarial review finds potential issues. Not all findings are actual bugs - verify before fixing.`;
}
