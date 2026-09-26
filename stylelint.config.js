export default {
  extends: ["stylelint-config-standard"],
  rules: {
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: ["apply", "custom-variant", "theme"],
      },
    ],
    "at-rule-empty-line-before": null,
    "at-rule-prelude-no-invalid": null,
    "color-function-alias-notation": null,
    "color-function-notation": null,
    "alpha-value-notation": null,
    "declaration-block-single-line-max-declarations": null,
    "import-notation": null,
    "lightness-notation": null,
    "hue-degree-notation": null,
    "property-no-deprecated": null,
    "comment-empty-line-before": null,
    "media-feature-range-notation": null,
    "no-descending-specificity": null,
    "no-duplicate-selectors": null,
    "rule-empty-line-before": null,
  },
};
