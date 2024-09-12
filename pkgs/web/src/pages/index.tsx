import Head from "next/head";
import { ToneContext, useToneInit } from "@/features/ScoreEditor/hooks/tone";
import { ScoreEditor } from "@/features/ScoreEditor/page";
import { BasicLayout } from "@/layouts/BasicLayout";

export default function Home() {
  const tone = useToneInit();

  return (
    <BasicLayout>
      <Head>
        <title>Harnica</title>
      </Head>

      <ToneContext.Provider value={tone!}>
        <ScoreEditor />
      </ToneContext.Provider>
    </BasicLayout>
  );
}
