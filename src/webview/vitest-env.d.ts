import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import type { ExpectStatic } from "vitest";

type AsymmetricMatcher = ReturnType<ExpectStatic["stringContaining"]>;

declare module "vitest" {
  // Vitest 5 uses Assertion<R, T>; jest-dom 7 still augments Assertion<T> and does not merge.
  // Extend Matchers instead until @testing-library/jest-dom ships Vitest 5 support.
  // The unused second type param must match Vitest's Matchers<R, T> for declaration merging.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars -- module augmentation shape
  interface Matchers<R extends void | Promise<void>, T = unknown>
    extends TestingLibraryMatchers<AsymmetricMatcher, R> {}
}
