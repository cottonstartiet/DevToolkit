import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { UpdateNotification } from "./UpdateNotification"

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
      <UpdateNotification />
    </div>
  )
}
