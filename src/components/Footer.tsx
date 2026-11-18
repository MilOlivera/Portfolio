import CurrentYear from "./CurrentYear";

export default function Footer() {
  return (
    <footer className="border-t border-border-strong">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-4 px-4 py-8 font-mono text-xs tracking-wider text-text-mute sm:px-6 md:grid-cols-[1fr_auto_1fr]">
        <p className="text-center md:text-left">
          <span className="text-text">MILTON OLIVERA</span> · ADROGUÉ, AR · © <CurrentYear />
        </p>
        <p className="justify-self-center rounded border border-dashed border-border-strong px-3 py-1.5 text-center">
          TRY: <span className="text-green">theme amber</span> IN THE TERMINAL
        </p>
        <p className="text-center md:text-right">BUILT WITH NEXT.JS 16 + REACT 19 + TAILWIND 4</p>
      </div>
    </footer>
  );
}
