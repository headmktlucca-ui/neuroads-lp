import { Composition } from "remotion";
import { HelloWorld } from "./HelloWorld";

const FPS = 30;
const DURATION_SECONDS = 5;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={FPS * DURATION_SECONDS}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{
          title: "NeuroAds",
        }}
      />
    </>
  );
};
