"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useGoogleDriveStore } from "@/store/google-drive-store"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"

interface GoogleDrivePickerProps {
  isOpen: boolean
  onClose: () => void
}

// Declare gapi and google types globally
declare global {
  var gapi: any
  var google: any
}

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

export function GoogleDrivePicker({ isOpen, onClose }: GoogleDrivePickerProps) {
  const { data: session } = useSession()
  const selectGoogleDriveFile = useGoogleDriveStore((state) => state.selectFile)
  const { toast } = useToast()
  const [isPickerLoaded, setIsPickerLoaded] = useState(false)

  useEffect(() => {
    if (!isOpen || isPickerLoaded) return

    const loadGoogleApis = () => {
      // Load the Google API client library
      gapi.load("client:auth2", () => {
        gapi.client
          .init({
            apiKey: GOOGLE_API_KEY,
            clientId: GOOGLE_CLIENT_ID,
            scope: "https://www.googleapis.com/auth/drive.readonly",
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
          })
          .then(() => {
            // Load the Google Picker API
            gapi.load("picker", () => {
              setIsPickerLoaded(true)
              console.log("Google API client and Picker loaded.")
            })
          })
          .catch((error: any) => {
            console.error("Error initializing Google API client:", error)
            toast({
              title: "Google API Error",
              description: "Failed to load Google API client. Check console for details.",
              variant: "destructive",
            })
          })
      })
    }

    // Check if gapi is already loaded, otherwise load it
    if (typeof gapi !== "undefined" && gapi.client) {
      loadGoogleApis()
    } else {
      const script = document.createElement("script")
      script.src = "https://apis.google.com/js/api.js"
      script.onload = loadGoogleApis
      script.onerror = () => {
        console.error("Failed to load Google API script.")
        toast({
          title: "Script Load Error",
          description: "Failed to load Google API script. Check your network.",
          variant: "destructive",
        })
      }
      document.body.appendChild(script)
    }
  }, [isOpen, isPickerLoaded, toast])

  const createPicker = () => {
    if (!isPickerLoaded || !session?.accessToken) {
      toast({
        title: "Picker Not Ready",
        description: "Google Picker is still loading or you are not authenticated.",
        variant: "destructive",
      })
      return
    }

    const view = new google.picker.View(google.picker.ViewId.IMAGES)
    view.setMimeTypes("image/png,image/jpeg,image/gif") // Filter for image types

    const picker = new google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(session.accessToken)
      .setDeveloperKey(GOOGLE_API_KEY)
      .setCallback(pickerCallback)
      .build()

    picker.setVisible(true)
  }

  const pickerCallback = async (data: any) => {
    if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
      const doc = data[google.picker.Response.DOCUMENTS][0]
      console.log("Selected Google Drive file:", doc)

      if (!doc.id || !doc.name || !doc.mimeType) {
        toast({
          title: "Invalid File",
          description: "Selected file is missing required information.",
          variant: "destructive",
        })
        return
      }

      // Construct a direct download link for publicly shared files
      // IMPORTANT: This link will only work if the file is shared publicly ("Anyone with the link")
      const publicDownloadUrl = `https://drive.google.com/uc?export=download&id=${doc.id}`

      selectGoogleDriveFile({ id: doc.id, name: doc.name, mimeType: doc.mimeType, url: publicDownloadUrl })
      onClose() // Close the picker dialog

      toast({
        title: "Google Drive File Selected",
        description: `"${doc.name}" selected. Ensure it's publicly shared for WhatsApp to access.`,
      })
    } else if (data[google.picker.Response.ACTION] === google.picker.Action.CANCEL) {
      console.log("Google Picker cancelled.")
      useGoogleDriveStore.getState().clearSelection() // Clear selection if cancelled
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Image from Google Drive</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 text-center">
          <p className="text-muted-foreground">Click the button below to open the Google Drive file picker.</p>
          <p className="text-sm text-orange-500 font-semibold">
            ⚠️ Important: The selected image MUST be publicly shared on Google Drive for WhatsApp to display it.
          </p>
          <Button onClick={createPicker} disabled={!isPickerLoaded || !session?.accessToken} className="w-full">
            {isPickerLoaded && session?.accessToken ? "Open Google Drive Picker" : "Loading Picker..."}
          </Button>
          {!session?.accessToken && (
            <p className="text-sm text-red-500">You must be signed in with Google to use the picker.</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
