// Decorative green corner brackets. Parent must be `relative`.
type Props = {
  size?: string; // Tailwind size class for each bracket, e.g. "size-3"
  glow?: boolean;
};

const POSITIONS = [
  "top-0 left-0 border-t border-l",
  "top-0 right-0 border-t border-r",
  "bottom-0 left-0 border-b border-l",
  "bottom-0 right-0 border-b border-r",
];

export default function CornerBrackets({ size = "size-3", glow = true }: Props) {
  return (
    <>
      {POSITIONS.map((pos) => (
        <span
          key={pos}
          aria-hidden
          className={`pointer-events-none absolute ${pos} ${size} border-green ${
            glow ? "shadow-[0_0_8px_var(--green-glow)]" : ""
          }`}
        />
      ))}
    </>
  );
}
