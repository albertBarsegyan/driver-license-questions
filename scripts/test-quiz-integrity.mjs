#!/usr/bin/env node
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildQuizQuestion } from "../app/entities/driving-question/lib/quiz.ts";

const questions = JSON.parse(
  readFileSync("app/entities/driving-question/data/questions.json", "utf8"),
);
assert.ok(questions.length > 0, "Expected source questions");

// Every source PDF question must be present: one "Պատ․" answer marker per question.
let pdftotextAvailable = true;
for (const file of readdirSync("docs").filter((name) =>
  name.endsWith(".pdf"),
)) {
  let text;
  try {
    text = execFileSync("pdftotext", ["-layout", join("docs", file), "-"], {
      encoding: "utf8",
    });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    pdftotextAvailable = false;
    break;
  }
  const expected = text.match(/Պատ/g)?.length ?? 0;
  const actual = questions.filter((q) => q.source.file === file).length;
  assert.equal(
    actual,
    expected,
    `${file}: ${actual} extracted, PDF has ${expected}`,
  );
}
if (!pdftotextAvailable)
  console.warn("pdftotext not found; skipped PDF question count comparison.");

// Every question must be usable in a quiz, and randomization must keep exactly one correct option.
for (const question of questions) {
  const ordered = buildQuizQuestion(question, false);
  assert.ok(ordered, `${question.id}: excluded from quiz`);
  for (let run = 0; run < 1000; run++) {
    const quiz = buildQuizQuestion(question);
    const correct = quiz.options.filter(
      (option) => option.id === quiz.correctOptionId,
    );
    assert.equal(quiz.options.length, question.originalOptions.length);
    assert.equal(correct.length, 1);
    assert.equal(correct[0].sourceIndex, question.sourceCorrectOptionIndex);
  }
}
console.log(
  `${pdftotextAvailable ? "All PDF questions present; " : ""}randomization preserved exactly one source-correct option for all ${questions.length} questions across ${questions.length * 1000} runs.`,
);
