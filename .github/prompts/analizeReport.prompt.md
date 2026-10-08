---
name: Analize Report
description: This prompt is used to analyze a report.
argument-hint: Provide the report content to analyze.
agent: ask
model: GPT-5.4
tools: [read, search]
---
Review the last test run and its results.
I need you to analyze the playwright report's trace and then help me to fix the failing test.