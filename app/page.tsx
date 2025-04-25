"use client"
import { Provider } from "react-redux"
import { store } from "@/lib/store"
import Header from "@/components/header"
import AnimatedBackground from "@/components/animated-background"
import Dashboard from "@/components/dashboard"
import { Toaster } from "@/components/ui/toaster"
import { ErrorBoundary } from "@/components/error-boundary"

export default function Home() {
  return (
    <Provider store={store}>
      <div className="min-h-screen bg-[#0a0a0a] text-gray-200 relative overflow-hidden">
        <AnimatedBackground />
        <div className="container mx-auto px-4 py-8 relative z-10">
          <Header />
          <main className="mt-8">
            <ErrorBoundary
              fallback={
                <p className="text-center py-8 text-gray-300">
                  Something went wrong loading the dashboard. Please try again later.
                </p>
              }
            >
              <Dashboard />
            </ErrorBoundary>
          </main>
        </div>
        <Toaster />
      </div>
    </Provider>
  )
}
