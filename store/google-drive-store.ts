import { create } from "zustand"

interface GoogleDriveFile {
  id: string // Google Drive file ID
  name: string
  mimeType: string
  url: string // The direct Google Drive public download URL
}

interface GoogleDriveStore {
  selectedFile: GoogleDriveFile | null
  selectFile: (file: GoogleDriveFile) => void
  clearSelection: () => void
}

export const useGoogleDriveStore = create<GoogleDriveStore>((set) => ({
  selectedFile: null,
  selectFile: (file) => set({ selectedFile: file }),
  clearSelection: () => set({ selectedFile: null }),
}))
