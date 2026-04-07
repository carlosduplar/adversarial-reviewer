# Adversarial Reviewer

Uses Gemini 3.1 Pro as an adversarial code reviewer to find security vulnerabilities, factual inaccuracies, edge cases, and improvement opportunities.

---

name: adversarial-reviewer
description: Use Gemini 3.1 Pro as an adversarial code reviewer to find security vulnerabilities, factual inaccuracies, edge cases, and improvement opportunities.
triggers:
  - adversarial review
  - security review
  - security audit
  - vulnerability assessment
  - critical analysis
  - code review
  - red team review
tools:
  - bash
  - glob
  - grep
  - read
install:
  - npm install -g @google/gemini-cli
