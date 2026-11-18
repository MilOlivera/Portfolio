// Decorative green corner brackets. Parent must be `relative`.
type Corner = "tl" | "tr" | "bl" | "br";

type Props = {
  size?: string; // Tailwind size class for each bracket, e.g. "size-3"
  glow?: boolean;
  corners?: Corner[]; // defaults to all four
};

const POSITIONS: Record<Corner, string> = {
  tl: "top-0 left-0 border-t border-l",
  tr: "top-0 right-0 border-t border-r",
  bl: "bottom-0 left-0 border-b border-l",
  br: "bottom-0 right-0 border-b border-r",
};

export default function CornerBrackets({
  size = "size-3",
  glow = true,
  corners = ["tl", "tr", "bl", "br"],
}: Props) {
  return (
    <>
      {corners.map((c) => (
        <span
          key={c}
          aria-hidden
          className={`pointer-events-none absolute ${POSITIONS[c]} ${size} border-green ${
            glow ? "shadow-[0_0_8px_var(--green-glow)]" : ""
          }`}
        />
      ))}
    </>
  );
}
