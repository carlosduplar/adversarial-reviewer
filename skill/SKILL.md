---
name: adversarial-reviewer
description: Adversarial code reviewer using Gemini to find security vulnerabilities, factual inaccuracies, and edge cases
author: Carlos Mello
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
---

# Adversarial Reviewer

Uses Gemini 3.1 Pro as an adversarial code reviewer to find security vulnerabilities, factual inaccuracies, edge cases, and improvement opportunities.
