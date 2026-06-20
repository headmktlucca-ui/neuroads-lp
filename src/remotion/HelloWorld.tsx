import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type HelloWorldProps = {
  title: string;
};

export const HelloWorld: React.FC<HelloWorldProps> = ({ title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0a0a14 0%, #1a1140 100%)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1
        style={{
          fontFamily: "system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 160,
          color: "#ffffff",
          transform: `scale(${scale})`,
          opacity,
          margin: 0,
          letterSpacing: -4,
        }}
      >
        {title}
      </h1>
    </AbsoluteFill>
  );
};
