import { ToneContext, useToneInit } from "@/features/ScoreEditor/hooks/tone";
import { ScoreEditor } from "@/features/ScoreEditor/page";
import { BasicLayout } from "@/layouts/BasicLayout";

export default function Home() {
  const tone = useToneInit();

  return (
    <BasicLayout>
      <ToneContext.Provider value={tone!}>
        <ScoreEditor />
      </ToneContext.Provider>
    </BasicLayout>
  );
}
