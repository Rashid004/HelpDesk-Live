import { Card, Skeleton } from "antd";

/**
 * Loading placeholder wrapped in a bold-bordered block so it reads in
 * the same visual language as the real content it replaces. Don't fight
 * antd's Skeleton internals — the border is enough.
 */
export function SkeletonPanel({
  rows = 4,
  title = true,
}: {
  rows?: number;
  title?: boolean;
}): React.JSX.Element {
  return (
    <Card styles={{ body: { padding: 18 } }}>
      <Skeleton active title={title} paragraph={{ rows }} />
    </Card>
  );
}
