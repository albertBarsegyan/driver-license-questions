import { Outlet } from "react-router";
import { AppFooter } from "~/widgets/app-footer/app-footer";
import { AppHeader } from "~/widgets/app-header/app-header";
export default function AppLayout() {
  return (
    <>
      <AppHeader />
      <main className="shell">
        <Outlet />
      </main>
      <AppFooter />
    </>
  );
}
