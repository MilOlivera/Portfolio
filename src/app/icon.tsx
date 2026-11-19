import { ImageResponse } from "next/og";

// Favicon: green terminal ">" (CSS vars don't exist in ImageResponse, so hex is intentional)
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          fontSize: 26,
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
