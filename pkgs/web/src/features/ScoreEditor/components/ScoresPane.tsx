import { memo } from "react";
import { RiMenu2Fill, RiMenuFill } from "react-icons/ri";
import { useAsync } from "react-use";
import { Button } from "@/components/Button";
import { connectIdb } from "@/infra/idb";
import { useDateFormat, useInteractiveAsync } from "@/utils/hooks";
import { twx } from "@/utils/tw";

export const ScorePane = memo(function ScorePane({
  opened,
  className,
}: {
  opened?: boolean;
  className?: string;
}) {
  const { data, loading, error } = useIdbScoreData();
  const dateFormat = useDateFormat();

  return (
    <div
      className={twx(
        "relative flex border-r-2 h-full",
        "w-[100vw] max-w-[300px]", // : "w-[100px]",
        className,
      )}
    >
      <ul className="flex-1">
        {data?.map((score) => (
          <li key={score.uid} suppressHydrationWarning>
            <Button $kind="none">
              {score.title}
              {dateFormat.formatRelative(score.updatedAt, new Date())}
            </Button>
          </li>
        ))}
      </ul>

      <div className="absolute m-16 bottom-0 right-0">
        <RiMenuFill size={32} />
      </div>
    </div>
  );
});

function useIdbScoreData() {
  return useInteractiveAsync(async ({ signal, revalidate }) => {
    const idb = await connectIdb();

    const timerId = window.setInterval(() => {
      revalidate();
    }, 200);

    signal.addEventListener("abort", () => {
      window.clearInterval(timerId);
    });

    return (await idb.getAll("scores")).sort(
      (a, b) => +b.updatedAt - +a.updatedAt,
    );
  }, []);
}
