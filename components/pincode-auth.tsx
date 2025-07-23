"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAppStore } from "@/lib/store"
import { motion } from "framer-motion"

export function PincodeAuth() {
  const [pincode, setPincode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const login = useAppStore((state) => state.login)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const success = login(pincode)
    if (!success) {
      setError("Incorrect pincode. Please try again.")
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <p className="text-center text-muted-foreground">Enter pincode to access settings</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          type="password"
          placeholder="Pincode"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          required
          aria-label="Pincode input"
        />
        {error && <p className="text-center text-sm text-red-500">{error}</p>}
        <Button type="submit" className="w-full">
          Unlock
        </Button>
      </form>
    </motion.div>
  )
}
