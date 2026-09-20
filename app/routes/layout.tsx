import { Outlet } from "react-router";
import { AppHeader } from "~/widgets/app-header/app-header";
export default function AppLayout() { return <><AppHeader /><main className="shell"><Outlet /></main></>; }
