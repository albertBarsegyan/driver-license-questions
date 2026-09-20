#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const questions = JSON.parse(readFileSync(join(root, "app/entities/driving-question/data/questions.json"), "utf8"));
const errors = [];
const ids = new Set();
for (const question of questions) {
  if (!question.id || ids.has(question.id)) errors.push(`${question.id || "unknown"}: missing or duplicate id`); ids.add(question.id);
  if (!question.question?.trim()) errors.push(`${question.id}: empty question`);
  if (!question.source?.file || !Number.isInteger(question.source.page) || !Number.isInteger(question.source.questionIndex)) errors.push(`${question.id}: invalid provenance`);
  if (!existsSync(join(root, "docs", question.source.file))) errors.push(`${question.id}: source PDF missing`);
  if (!question.originalOptions?.length) errors.push(`${question.id}: no original options`);
  const optionIds = new Set(question.originalOptions.map((option) => option.id));
  if (optionIds.size !== question.originalOptions.length) errors.push(`${question.id}: duplicate option ids`);
  if (question.originalOptions.some((option) => !option.text?.trim())) errors.push(`${question.id}: empty option text`);
  if (!question.originalOptions.some((option) => option.sourceIndex === question.sourceCorrectOptionIndex)) errors.push(`${question.id}: answer marker does not map to source option`);
  if (question.visual && !existsSync(join(root, "public", question.visual.src))) errors.push(`${question.id}: visual page asset missing`);
}
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`Validated ${questions.length} extracted source questions with no critical integrity errors.`);
