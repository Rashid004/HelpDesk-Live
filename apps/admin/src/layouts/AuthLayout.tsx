import { Outlet } from "react-router-dom";
import { COLORS } from "../lib/theme";

/** Centered shell for /login — bold bordered card on the warm ground,
 *  loosely matching apps/web's auth visual language. */
export function AuthLayout(): React.JSX.Element {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: COLORS.cream,
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        <Outlet />
      </div>
    </div>
  );
}
