"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PincodeAuth } from "@/components/pincode-auth"
import { SecretKeyForm } from "@/components/secret-key-form"
import { useAppStore } from "@/lib/store"
import { ThemeToggle } from "@/components/theme-toggle"

export default function SettingsPage() {
  const router = useRouter()
  const { isLoggedIn, checkSession, isMainLoggedIn } = useAppStore()

  useEffect(() => {
    if (!isMainLoggedIn) {
      router.push("/login")
    } else {
      // Only check pincode session if main app is logged in
      checkSession()
    }
  }, [isMainLoggedIn, router, checkSession])

  if (!isMainLoggedIn) {
    return null // Or a loading spinner while redirecting
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-center flex-1">Secret Key Settings</CardTitle>
          <ThemeToggle />
        </CardHeader>
        <CardContent>{isLoggedIn ? <SecretKeyForm /> : <PincodeAuth />}</CardContent>
      </Card>
    </div>
  )
}
