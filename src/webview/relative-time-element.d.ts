import type { DetailedHTMLProps, HTMLAttributes } from "react";

type RelativeTimeElementProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  datetime?: string;
  format?: "datetime" | "relative" | "duration";
  hour?: "numeric" | "2-digit";
  minute?: "numeric" | "2-digit";
  day?: "numeric" | "2-digit";
  month?: "numeric" | "2-digit" | "short" | "long" | "narrow";
  year?: "numeric" | "2-digit";
  weekday?: "" | "short" | "long" | "narrow";
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "relative-time": RelativeTimeElementProps;
    }
  }
}
