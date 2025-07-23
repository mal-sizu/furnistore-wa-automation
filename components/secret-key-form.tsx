"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAppStore } from "@/lib/store"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export function SecretKeyForm() {
  const { secretKeys, setSecretKey, logout } = useAppStore()
  const [whatsappKey, setWhatsappKey] = useState(secretKeys.whatsapp || "")
  const [gmailKey, setGmailKey] = useState(secretKeys.gmail || "")
  const [googleMapsKey, setGoogleMapsKey] = useState(secretKeys.googleMaps || "")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setWhatsappKey(secretKeys.whatsapp || "")
    setGmailKey(secretKeys.gmail || "")
    setGoogleMapsKey(secretKeys.googleMaps || "")
  }, [secretKeys])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    const keysToSave = {
      whatsapp: whatsappKey,
      gmail: gmailKey,
      googleMaps: googleMapsKey,
    }

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(keysToSave),
      })

      if (response.ok) {
        toast.success("Secret keys saved successfully!")
        // Update Zustand store with potentially new values from server (if server validated/transformed)
        // For this demo, we just use the local state values
        setSecretKey("whatsapp", whatsappKey)
        setSecretKey("gmail", gmailKey)
        setSecretKey("googleMaps", googleMapsKey)
      } else {
        toast.error("Failed to save secret keys.")
        console.error("Failed to save keys:", response.statusText)
      }
    } catch (error) {
      toast.error("Error saving secret keys.")
      console.error("Error saving keys:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <Label htmlFor="whatsapp-key">WhatsApp API Key</Label>
          <Input
            id="whatsapp-key"
            type="password"
            value={whatsappKey}
            onChange={(e) => setWhatsappKey(e.target.value)}
            placeholder="Enter WhatsApp API Key"
            aria-label="WhatsApp API Key input"
          />
        </div>
        <div>
          <Label htmlFor="gmail-key">Gmail API Key</Label>
          <Input
            id="gmail-key"
            type="password"
            value={gmailKey}
            onChange={(e) => setGmailKey(e.target.value)}
            placeholder="Enter Gmail API Key"
            aria-label="Gmail API Key input"
          />
        </div>
        <div>
          <Label htmlFor="google-maps-key">Google Maps API Key</Label>
          <Input
            id="google-maps-key"
            type="password"
            value={googleMapsKey}
            onChange={(e) => setGoogleMapsKey(e.target.value)}
            placeholder="Enter Google Maps API Key"
            aria-label="Google Maps API Key input"
          />
        </div>
        <Button type="submit" className="w-full" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Keys"
          )}
        </Button>
      </form>
      <Button onClick={logout} variant="outline" className="w-full mt-4 bg-transparent">
        Logout
      </Button>
    </motion.div>
  )
}
