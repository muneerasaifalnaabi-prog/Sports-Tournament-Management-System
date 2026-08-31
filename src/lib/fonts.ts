import localFont from "next/font/local";

/**
 * App-wide typeface. Every static weight is registered so Tailwind's
 * font-light/normal/medium/semibold/bold/black classes each resolve to a real
 * drawn face instead of the browser faking bold/light via synthesis.
 */
export const rubik = localFont({
  src: [
    { path: "../../fonts/rubik/Rubik-Light.ttf", weight: "300", style: "normal" },
    { path: "../../fonts/rubik/Rubik-LightItalic.ttf", weight: "300", style: "italic" },
    { path: "../../fonts/rubik/Rubik-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../fonts/rubik/Rubik-Italic.ttf", weight: "400", style: "italic" },
    { path: "../../fonts/rubik/Rubik-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../fonts/rubik/Rubik-MediumItalic.ttf", weight: "500", style: "italic" },
    { path: "../../fonts/rubik/Rubik-Bold.ttf", weight: "700", style: "normal" },
    { path: "../../fonts/rubik/Rubik-BoldItalic.ttf", weight: "700", style: "italic" },
    { path: "../../fonts/rubik/Rubik-Black.ttf", weight: "900", style: "normal" },
    { path: "../../fonts/rubik/Rubik-BlackItalic.ttf", weight: "900", style: "italic" },
  ],
  variable: "--font-sans",
  display: "swap",
});

/**
 * Brand wordmark only ("STMS" logo lockups) — personal-use license (see fonts/ReadMe.txt).
 * Not for body copy: the jagged italic cut hurts legibility below display sizes.
 */
export const rushDriver = localFont({
  src: "../../fonts/RushDriver-Italic.otf",
  variable: "--font-brand",
  display: "swap",
});
