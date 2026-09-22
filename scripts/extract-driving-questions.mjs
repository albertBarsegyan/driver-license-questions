#!/usr/bin/env node
/**
 * Deterministic, source-first extractor for the supplied Armenian PDFs.
 * It intentionally does not infer legal answers: only the PDF's Պատ․ marker
 * can populate sourceCorrectOptionIndex.
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { basename, extname, join } from "node:path";

const root = process.cwd();
const docs = join(root, "docs");
const outDir = join(root, "app", "entities", "driving-question", "data");
const reportsDir = join(root, "reports");
const visualDir = join(root, "public", "question-pages");
const imageDir = join(root, "public", "question-images");
mkdirSync(outDir, { recursive: true });
mkdirSync(reportsDir, { recursive: true });
mkdirSync(visualDir, { recursive: true });
mkdirSync(imageDir, { recursive: true });

const pdfs = readdirSync(docs).filter((file) => extname(file).toLowerCase() === ".pdf").sort((a, b) => a.localeCompare(b, "hy"));
const answerPattern = /Պատ[․.՝]?[՝:]?\s*([0-9]+)/u;
// Source sets use both `1.Տարբերակ` and `1. Տարբերակ` (occasionally `1 .`).
const optionPattern = /(?:^|\n)([1-9][0-9]*)\s*\.(?=\s*\S)/gu;
const visualLanguage = /նկար|իրադրությ|նշված (?:տեղ|գոտ|հետագծ)|ավտոմոբիլ|տրանսպորտային միջոցի վարորդ|ուղղությ(?:ամ|ո)ւն|նշան|գծանշ/u;
function classify(question, file) {
  const rules = [
    ["Առաջին օգնություն", /օգնություն|տուժած|վնասված|արյունահոս|վերք|կոտրված|շնչառ|այրված|ցնցում/u],
    ["Ճանապարհային նշաններ", /նշան/u], ["Գծանշումներ", /գծանշ/u], ["Երկաթուղային գծանցներ", /երկաթուղ/u],
    ["Հետիոտներ", /հետիոտ/u], ["Հեծանվորդներ", /հեծանվ/u], ["Տրամվայ", /տրամվայ/u],
    ["Կանգառ", /կանգառ/u], ["Կայանում", /կայան/u], ["Վազանց", /վազանց/u], ["Հետընթաց", /հետընթաց/u],
    ["Հետադարձ", /հետադարձ/u], ["Շրջադարձ", /շրջադարձ/u], ["Խաչմերուկներ", /խաչմերուկ/u],
    ["Առաջնահերթություն", /առաջնահերթ/u], ["Վերադասավորում", /վերադաս/u], ["Մերձակա տարածք", /բակ|մերձակա/u],
  ];
  // Group 10 is the first-aid question set. Some of its short prompts don't
  // contain a medical keyword, so assign the category from its source set.
  if (file === "Խումբ-10 (հայերեն).pdf") return ["Առաջին օգնություն"];
  const matches = rules.filter(([, test]) => test.test(question)).map(([category]) => category).slice(0, 2);
  return matches.length ? matches : ["Այլ"];
}

function shell(command, args) {
  return execFileSync(command, args, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
}
function pageCount(pdfPath) {
  return Number(shell("pdfinfo", [pdfPath]).match(/^Pages:\s+(\d+)/m)?.[1] || 0);
}
function normalize(lines) {
  return lines.map((line) => typeof line === "string" ? line : line.text).join(" ").replace(/\s+/gu, " ").trim();
}
function xmlLines(pdfPath, page, side) {
  const xml = shell("pdftotext", ["-f", String(page), "-l", String(page), "-bbox", pdfPath, "-"]);
  const words = [...xml.matchAll(/<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="[\d.]+" yMax="[\d.]+">([\s\S]*?)<\/word>/g)]
    .map((m) => ({ x: Number(m[1]), y: Number(m[2]), text: m[3].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">") }))
    .filter((word) => side === "left" ? word.x < 300 : word.x >= 300);
  const groups = new Map();
  for (const word of words) {
    const key = Math.round(word.y * 10) / 10;
    const group = groups.get(key) || [];
    group.push(word);
    groups.set(key, group);
  }
  return [...groups.entries()].sort((a, b) => a[0] - b[0]).map(([y, wordsOnLine]) => ({
    y,
    text: wordsOnLine.sort((a, b) => a.x - b.x).map((word) => word.text).join(" "),
  }));
}
function parseBlock(lines, context) {
  const joined = lines.map((line) => line.text).join("\n").trim();
  const answer = joined.match(answerPattern);
  if (!answer) return { warning: { ...context, reason: "missing-answer-key", extractedText: normalize(lines) } };
  const beforeAnswer = joined.slice(0, answer.index).trim();
  const matches = [...beforeAnswer.matchAll(optionPattern)];
  if (!matches.length) {
    return { warning: { ...context, reason: "no-detectable-options", extractedText: normalize(lines), sourceAnswer: Number(answer[1]), visualReviewRequired: true } };
  }
  const question = normalize(beforeAnswer.slice(0, matches[0].index).split("\n"));
  const options = matches.map((match, i) => ({
    sourceIndex: Number(match[1]),
    text: normalize(beforeAnswer.slice(match.index + match[0].length, i + 1 < matches.length ? matches[i + 1].index : undefined).split("\n")),
  }));
  const sourceAnswer = Number(answer[1]);
  const reasons = [];
  if (!question) reasons.push("empty-question-text");
  if (options.length < 2) reasons.push("fewer-than-two-options");
  if (!options.some((option) => option.sourceIndex === sourceAnswer)) reasons.push("answer-index-not-present-in-options");
  if (options.length > 4) reasons.push("more-than-four-source-options");
  if (options.some((option) => !option.text)) reasons.push("empty-option-text");
  const id = `${context.sourceId}-page-${String(context.page).padStart(2, "0")}-q${String(context.questionIndex).padStart(3, "0")}`;
  const imageDependent = visualLanguage.test(question);
  // pdftohtml reports image coordinates at 1.5x the PDF text coordinate system.
  // Matching only within this question's own column/answer block prevents cross-question images.
  const matchingImage = context.images.find((image) => image.side === context.side && image.y >= context.startY - 18 && image.y <= context.endY + 8);
  const visual = matchingImage
    ? { type: "image", src: matchingImage.src, page: context.page }
    : imageDependent ? { type: "page", src: `/question-pages/${context.sourceId}-page-${String(context.page).padStart(2, "0")}.jpg`, page: context.page } : undefined;
  return {
    question: {
      id,
      question,
      originalOptions: options.map((option) => ({ id: `${id}-option-${option.sourceIndex}`, ...option, generated: false })),
      sourceCorrectOptionIndex: sourceAnswer,
      source: { file: context.file, page: context.page, questionIndex: context.questionIndex },
      categories: classify(question, context.file),
      ...(visual ? { visual } : {}),
      ...(reasons.length ? { needsReview: true, reviewReasons: reasons } : {}),
    },
    warnings: reasons.map((reason) => ({ ...context, id, reason, extractedText: question, extractedOptions: options, sourceAnswer, visualReviewRequired: imageDependent })),
  };
}
function renderPage(pdfPath, sourceId, page) {
  const target = join(visualDir, `${sourceId}-page-${String(page).padStart(2, "0")}`);
  if (!existsSync(`${target}.jpg`)) shell("pdftoppm", ["-f", String(page), "-l", String(page), "-scale-to", "1200", "-jpeg", "-jpegopt", "quality=78", "-singlefile", pdfPath, target]);
}
function extractPageImages(pdfPath, sourceId, page) {
  const temporaryBase = join("/tmp", `driver-question-${sourceId}-${page}`);
  shell("pdftohtml", ["-f", String(page), "-l", String(page), "-xml", "-hidden", pdfPath, temporaryBase]);
  const xml = existsSync(`${temporaryBase}.xml`) ? readFileSync(`${temporaryBase}.xml`, "utf8") : "";
  return [...xml.matchAll(/<image top="(\d+)" left="(\d+)" width="(\d+)" height="(\d+)" src="([^"]+)"\/>/g)].map((match, index) => {
    const original = match[5];
    const targetName = `${sourceId}-page-${String(page).padStart(2, "0")}-image-${String(index + 1).padStart(2, "0")}.png`;
    const target = join(imageDir, targetName);
    if (existsSync(original) && !existsSync(target)) copyFileSync(original, target);
    return { x: Number(match[2]) / 1.5, y: Number(match[1]) / 1.5, side: Number(match[2]) < 459 ? "left" : "right", src: `/question-images/${targetName}` };
  });
}

const questions = [], warnings = [], inventory = [];
for (const file of pdfs) {
  const pdfPath = join(docs, file);
  const pages = pageCount(pdfPath);
  const sourceId = basename(file, ".pdf").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").toLowerCase();
  let questionIndex = 0;
  let imageQuestions = 0;
  let answerKeys = 0;
  const fileWarnings = [];
  for (let page = 1; page <= pages; page++) {
    const images = extractPageImages(pdfPath, sourceId, page);
    for (const side of ["left", "right"]) {
      const lines = xmlLines(pdfPath, page, side);
      const blocks = [];
      let current = [];
      for (const line of lines) {
        current.push(line);
        if (answerPattern.test(line.text)) { blocks.push(current); current = []; answerKeys++; }
      }
      if (normalize(current)) fileWarnings.push({ file, page, side, reason: "unclosed-content-after-answer-marker", extractedText: normalize(current) });
      for (const block of blocks) {
        questionIndex++;
        const result = parseBlock(block, { file, page, questionIndex, sourceId, side, images, startY: block[0]?.y ?? 0, endY: block.at(-1)?.y ?? 0 });
        if (result.question) {
          if (result.question.visual) { imageQuestions++; renderPage(pdfPath, sourceId, page); }
          questions.push(result.question);
          warnings.push(...result.warnings);
          fileWarnings.push(...result.warnings);
        } else if (result.warning) { warnings.push(result.warning); fileWarnings.push(result.warning); }
      }
    }
  }
  inventory.push({ filename: file, path: `docs/${file}`, pages, extractionStatus: fileWarnings.length ? "completed-with-warnings" : "completed", questionsFound: questionIndex, imageDependentQuestions: imageQuestions, answerKeysFound: answerKeys, parsingWarnings: fileWarnings.length, unresolvedQuestions: fileWarnings.filter((x) => /missing|no-detectable|answer-index|fewer|empty/.test(x.reason)).length });
}

const normalizedGroups = new Map();
for (const question of questions) {
  const signature = `${question.question.toLocaleLowerCase("hy").replace(/\s+/g, " ")}::${question.originalOptions.map((option) => option.text).join("|")}`;
  const group = normalizedGroups.get(signature) || [];
  group.push(question);
  normalizedGroups.set(signature, group);
}
let duplicateNo = 0;
for (const group of normalizedGroups.values()) if (group.length > 1) { duplicateNo++; for (const question of group) question.duplicateGroupId = `duplicate-${String(duplicateNo).padStart(3, "0")}`; }

const sourceOptions = questions.reduce((count, q) => count + q.originalOptions.length, 0);
const report = {
  generatedAt: "deterministic-from-source-pdfs",
  filesProcessed: inventory.length,
  pagesProcessed: inventory.reduce((sum, file) => sum + file.pages, 0),
  questionsExtracted: questions.length,
  questionsWithImages: questions.filter((q) => q.visual).length,
  questionsWithExtractedImages: questions.filter((q) => q.visual?.type === "image").length,
  questionsWithPageVisualFallback: questions.filter((q) => q.visual?.type === "page").length,
  questionsWithFourSourceOptions: questions.filter((q) => q.originalOptions.length === 4).length,
  questionsWithGeneratedDistractors: 0,
  totalSourceOptions: sourceOptions,
  questionsWith2SourceOptions: questions.filter((q) => q.originalOptions.length === 2).length,
  questionsWith3SourceOptions: questions.filter((q) => q.originalOptions.length === 3).length,
  questionsWith4SourceOptions: questions.filter((q) => q.originalOptions.length === 4).length,
  questionsRequiringGeneratedDistractors: questions.filter((q) => q.originalOptions.length >= 2 && q.originalOptions.length < 4).length,
  totalGeneratedDistractors: 0,
  duplicateGroups: duplicateNo,
  reviewRequiredQuestions: questions.filter((q) => q.needsReview).length,
  warnings: warnings.length,
  errors: 0,
  files: inventory,
};
writeFileSync(join(outDir, "questions.json"), `${JSON.stringify(questions, null, 2)}\n`);
writeFileSync(join(reportsDir, "question-extraction-report.json"), `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(join(reportsDir, "question-review.json"), `${JSON.stringify(warnings, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
