"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAppStore } from "@/lib/store"
import { motion } from "framer-motion"
import { Send, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function WhatsappMessenger() {
  const [messageText, setMessageText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const addMessage = useAppStore((state) => state.addMessage)
  const updateMessageStatus = useAppStore((state) => state.updateMessageStatus)
  const messages = useAppStore((state) => state.messages)

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || isSending) return

    setIsSending(true)
    const messageId = addMessage(messageText)
    setMessageText("")

    try {
      const response = await fetch("/api/whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: messageText }),
      })

      if (response.ok) {
        updateMessageStatus(messageId, "sent")
        toast.success("Message sent successfully!")
      } else {
        updateMessageStatus(messageId, "failed")
        toast.error("Failed to send message.")
        console.error("Failed to send message:", response.statusText)
      }
    } catch (error) {
      updateMessageStatus(messageId, "failed")
      toast.error("Error sending message.")
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex-1 space-y-2 max-h-60 overflow-y-auto pr-2">
        {messages.length === 0 && <p className="text-center text-muted-foreground">No messages yet. Send one!</p>}
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            layout
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg",
              msg.status === "sent" && "bg-green-50 dark:bg-green-950",
              msg.status === "failed" && "bg-red-50 dark:bg-red-950",
              msg.status === "pending" && "bg-blue-50 dark:bg-blue-950",
            )}
          >
            <div className="flex-1">
              <p className="text-sm">{msg.text}</p>
              <p className="text-xs text-muted-foreground">{new Date(msg.timestamp).toLocaleTimeString()}</p>
            </div>
            {msg.status === "pending" && (
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" aria-label="Sending" />
            )}
            {msg.status === "sent" && <CheckCircle className="h-4 w-4 text-green-500" aria-label="Sent" />}
            {msg.status === "failed" && <XCircle className="h-4 w-4 text-red-500" aria-label="Failed" />}
          </motion.div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          type="text"
          placeholder="Type your message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          className="flex-1"
          aria-label="Message input"
          disabled={isSending}
        />
        <motion.div whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 700, damping: 30 }}>
          <Button type="submit" disabled={isSending || !messageText.trim()}>
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </div>
  )
}
