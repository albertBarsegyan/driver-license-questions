import { useLayoutEffect, useRef } from "react";
import type { SourceQuestion } from "~/entities/driving-question/model/types";

export function SourceLine({
  question,
}: Readonly<{ question: SourceQuestion }>) {
  return (
    <p className="source-line">
      Աղբյուր՝ {question.source.file} · էջ {question.source.page} · հարց{" "}
      {question.source.questionIndex}
    </p>
  );
}

export function QuestionVisual({
  question,
}: Readonly<{ question: SourceQuestion }>) {
  if (!question.visual?.src) {
    return null;
  }

  const extracted = question.visual.type === "image";
  return (
    <figure className="visual">
      <img
        src={question.visual.src}
        alt={
          extracted
            ? `Հարցի բնօրինակ պատկեր՝ էջ ${question.visual.page}`
            : `Աղբյուրի էջ ${question.visual.page}`
        }
        loading="lazy"
      />
      <figcaption>
        {extracted
          ? `PDF-ից արտածված բնօրինակ պատկեր · էջ ${question.visual.page}`
          : `Աղբյուրի էջ ${question.visual.page}. Նկարը ցուցադրված է ամբողջական համատեքստով։`}
      </figcaption>
    </figure>
  );
}

const MOBILE_QUERY = "(max-width: 620px)";
const MAX_FONT = 16;
const MIN_FONT = 12;

/**
 * On phones the question page is locked to the viewport. Pick the largest
 * answer font that keeps the question and every answer on screen while still
 * leaving the visual a usable share of the height.
 */
export function useFitQuestion<T extends HTMLElement>(key: unknown) {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const page = ref.current;
    if (!page) return;
    const media = window.matchMedia(MOBILE_QUERY);

    function fit() {
      if (!page) return;
      page.style.removeProperty("--fit-font");
      delete page.dataset.overflow;
      if (!media.matches) return;
      const visual = page.querySelector<HTMLElement>(".visual");
      for (let size = MAX_FONT; size >= MIN_FONT; size -= 0.5) {
        page.style.setProperty("--fit-font", `${size}px`);
        const textFits = page.scrollHeight <= page.clientHeight + 1;
        const visualFits =
          !visual || visual.clientHeight >= page.clientHeight * 0.3;
        if (textFits && visualFits) return;
      }
      if (page.scrollHeight > page.clientHeight + 1) {
        page.dataset.overflow = "";
      }
    }

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(page);
    media.addEventListener("change", fit);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", fit);
    };
  }, [key]);

  return ref;
}
