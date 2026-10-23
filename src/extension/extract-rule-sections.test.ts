import { describe, expect, it } from "vitest";
import { extractRuleSections } from "./extract-rule-sections.js";

describe("extractRuleSections", () => {
  it("collects h2 headings in document order", () => {
    const body = ["Intro", "## Alpha", "text", "## Beta", ""].join("\n");
    expect(extractRuleSections(body)).toEqual(["Alpha", "Beta"]);
  });

  it("ignores headings inside fenced code blocks", () => {
    const body = ["```", "## Inside Fence", "```", "## Outside", ""].join("\n");
    expect(extractRuleSections(body)).toEqual(["Outside"]);
  });

  it("ignores tilde fences and nested fence content", () => {
    const body = ["~~~md", "## Tilde Fence", "~~~", "## After", ""].join("\n");
    expect(extractRuleSections(body)).toEqual(["After"]);
  });

  it("does not count # or ### headings", () => {
    const body = ["# Title", "### Nested", "body", ""].join("\n");
    expect(extractRuleSections(body)).toEqual([]);
  });

  it("returns an empty list when there are no h2 headings", () => {
    expect(extractRuleSections("plain body")).toEqual([]);
  });

  it("strips optional closing hashes from h2 titles", () => {
    expect(extractRuleSections("## Title ##")).toEqual(["Title"]);
  });
});
