import { ImageResponse } from "next/og";

// Apple touch icon: same green ">" as icon.tsx, at 180×180
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#000000",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#25DB79",
          fontSize: 140,
          fontWeight: 700,
          fontFamily: "ui-monospace, monospace",
          paddingLeft: 2,
        }}
      >
        &gt;
      </div>
    ),
    { ...size },
  );
}
