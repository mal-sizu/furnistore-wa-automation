import { create } from "zustand"

interface Message {
  id: string
  text: string
  timestamp: number
  status: "pending" | "sent" | "failed"
}

interface SecretKeys {
  whatsapp?: string
  gmail?: string
  googleMaps?: string
}

interface AppState {
  messages: Message[]
  addMessage: (text: string) => string // Returns the ID of the new message
  updateMessageStatus: (id: string, status: "sent" | "failed") => void

  // Pincode and Session Management (for settings page)
  isLoggedIn: boolean // For settings pincode access
  loginTimestamp: number | null // For settings pincode session
  secretKeys: SecretKeys
  login: (pincode: string) => boolean // For settings pincode login
  logout: () => void // For settings pincode logout
  checkSession: () => void // For settings pincode session check

  // Main App Login Management
  isMainLoggedIn: boolean
  mainLogin: () => void
  mainLogout: () => void
}

const MOCK_PINCODE = "furnistore"
const SETTINGS_SESSION_DURATION_MS = 12 * 60 * 60 * 1000 // 12 hours for settings pincode session

export const useAppStore = create<AppState>((set, get) => ({
  // Message state (from previous iteration)
  messages: [],
  addMessage: (text) => {
    const newMessage: Message = {
      id: Date.now().toString(), // Simple unique ID
      text,
      timestamp: Date.now(),
      status: "pending",
    }
    set((state) => ({ messages: [...state.messages, newMessage] }))
    return newMessage.id // Return ID for status update
  },
  updateMessageStatus: (id, status) =>
    set((state) => ({
      messages: state.messages.map((msg) => (msg.id === id ? { ...msg, status } : msg)),
    })),

  // Pincode and Session Management (for settings page)
  isLoggedIn: false,
  loginTimestamp: null,
  secretKeys: {}, // Initialize with empty keys

  login: (pincode: string) => {
    if (pincode === MOCK_PINCODE) {
      const timestamp = Date.now()
      set({ isLoggedIn: true, loginTimestamp: timestamp })
      // Persist login state in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("settingsLoginTimestamp", timestamp.toString())
        localStorage.setItem("isSettingsLoggedIn", "true")
      }
      return true
    }
    return false
  },

  logout: () => {
    set({ isLoggedIn: false, loginTimestamp: null, secretKeys: {} })
    // Clear login state from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("settingsLoginTimestamp")
      localStorage.removeItem("isSettingsLoggedIn")
      localStorage.removeItem("secretKeys") // Clear stored keys on logout
    }
  },

  checkSession: () => {
    if (typeof window === "undefined") return

    const storedTimestamp = localStorage.getItem("settingsLoginTimestamp")
    const storedIsLoggedIn = localStorage.getItem("isSettingsLoggedIn") === "true"
    const storedSecretKeys = localStorage.getItem("secretKeys")

    if (storedIsLoggedIn && storedTimestamp) {
      const timestamp = Number.parseInt(storedTimestamp, 10)
      if (Date.now() - timestamp < SETTINGS_SESSION_DURATION_MS) {
        set({ isLoggedIn: true, loginTimestamp: timestamp })
        if (storedSecretKeys) {
          try {
            set({ secretKeys: JSON.parse(storedSecretKeys) })
          } catch (e) {
            console.error("Failed to parse stored secret keys", e)
            localStorage.removeItem("secretKeys")
          }
        }
      } else {
        // Session expired
        get().logout()
      }
    } else {
      // No stored session or invalid
      get().logout()
    }
  },

  // @ts-ignore
  setSecretKey: (keyType, value) => {
    set((state) => {
      const newSecretKeys = { ...state.secretKeys, [keyType]: value }
      // Persist keys in localStorage (for demo purposes, in real app, this would be server-side)
      if (typeof window !== "undefined") {
        localStorage.setItem("secretKeys", JSON.stringify(newSecretKeys))
      }
      return { secretKeys: newSecretKeys }
    })
  },

  // Main App Login Management
  isMainLoggedIn: false,
  mainLogin: () => {
    set({ isMainLoggedIn: true })
    if (typeof window !== "undefined") {
      localStorage.setItem("isMainLoggedIn", "true")
    }
  },
  mainLogout: () => {
    set({ isMainLoggedIn: false })
    if (typeof window !== "undefined") {
      localStorage.removeItem("isMainLoggedIn")
    }
    // Also log out from settings session if main app logs out
    get().logout()
  },
}))

// Initialize main app login state from localStorage on first load
if (typeof window !== "undefined") {
  const storedMainLoggedIn = localStorage.getItem("isMainLoggedIn") === "true"
  useAppStore.setState({ isMainLoggedIn: storedMainLoggedIn })
  // Also check settings session if main app is logged in
  if (storedMainLoggedIn) {
    useAppStore.getState().checkSession()
  }
}
