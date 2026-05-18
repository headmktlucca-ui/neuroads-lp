export default function HomePageBackground() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 bg-top bg-repeat-y bg-[length:100%_auto]"
        style={{ backgroundImage: "url('/images/background_hub_repeat_flow.png')" }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent via-[#f7f8fa]/75 to-bg-main" />
    </>
  );
}
