import type { ReactNode } from "react";
import { ConfigProvider, App as AntApp } from "antd";
import { antdTheme } from "../lib/theme";

/**
 * App-wide providers. ConfigProvider applies the neobrutalism theme
 * tokens; AntApp supplies context for message/notification/modal so
 * feature code can call `App.useApp()` instead of the static APIs.
 */
export function Providers({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <ConfigProvider theme={antdTheme}>
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  );
}
