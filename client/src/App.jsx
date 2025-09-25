import { Outlet } from "react-router-dom"


function App() {

  return (
    <div className="min-w-screen bg-slate-900 text-white scrollbar">
      <main className="w-full h-full overflow-x-hidden">
        <Outlet/>
      </main>
    </div>
  )
}

export default App
