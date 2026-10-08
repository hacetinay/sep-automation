---
name: Fix Test
description: This prompt is used to fix a failing test.
argument-hint: Provide the test code and the issue to fix.
agent: edit
model: GPT-5.4
tools: [read, edit]
---

Based on how we fixed this failed specs just now, I need you to create me a skill that  call and
paste the path of the spec that was failing, then I want the skill to be able to
help me to debug and fix the test for me. I wanna make sure that the skill is capable of using playwright cli, capable of exploring the web application through playwright cli.
Do the best you can to make this skill a world class copilot skill that can be used for fixing and healing any failed specs of the Playwright tests.