import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/layout.tsx", [
    index("routes/home.tsx"),
    route("questions", "routes/questions.tsx"),
    route("questions/:questionId", "routes/question.tsx"),
    route("categories", "routes/categories.tsx"),
    route("categories/:category", "routes/category.tsx"),
    route("sources", "routes/sources.tsx"),
    route("sources/:sourceId", "routes/source.tsx"),
    route("quiz", "routes/quiz.tsx"),
  ]),
] satisfies RouteConfig;
