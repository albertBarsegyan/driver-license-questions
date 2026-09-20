#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const questions = JSON.parse(readFileSync("app/entities/driving-question/data/questions.json", "utf8"));
const eligible = questions.filter(q => !q.needsReview && q.originalOptions.length === 4 && q.originalOptions.some(o => o.sourceIndex === q.sourceCorrectOptionIndex));
assert.ok(eligible.length > 0, "Expected eligible source questions");
for (const question of eligible) for (let run = 0; run < 1000; run++) {
  const options = [...question.originalOptions];
  for (let i = options.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [options[i], options[j]] = [options[j], options[i]]; }
  const correct = options.filter(option => option.sourceIndex === question.sourceCorrectOptionIndex);
  assert.equal(options.length, 4); assert.equal(correct.length, 1);
}
console.log(`Randomization preserved exactly one source-correct option across ${eligible.length * 1000} runs.`);
