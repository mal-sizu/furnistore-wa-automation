"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { Toaster } from "@/components/ui/toaster"

export default function HomePage() {
  const router = useRouter()
  const { isMainLoggedIn } = useAppStore()

  useEffect(() => {
    if (isMainLoggedIn) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }, [isMainLoggedIn, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting...</p>
      <Toaster /> {/* Add Toaster component for notifications */}
    </div>
  )
}