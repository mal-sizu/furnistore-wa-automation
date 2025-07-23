// This file is renamed from the provided attachment for clarity.
// src/types/index.ts

// ======================
// Core WhatsApp Payload Types
// ======================
export interface WhatsAppBasePayload {
  messaging_product: "whatsapp"
  to: string
}

// ======================
// Interactive List Types
// ======================
export interface ListRow {
  id: string
  title: string
  description?: string
}

export interface ListSection {
  rows: ListRow[]
}

export interface ListAction {
  button: string
  sections: ListSection[]
}

export interface ListHeader {
  type: "text"
  text: string
}

export interface ListBody {
  text: string
}

export interface InteractiveList {
  type: "list"
  header: ListHeader
  body: ListBody
  action: ListAction
}

export interface InteractiveListPayload extends WhatsAppBasePayload {
  type: "interactive"
  interactive: InteractiveList
}

export type ListTemplates = {
  [key: string]: InteractiveList
}

// ======================
// Reply Button Types
// ======================
export interface ReplyButton {
  id: string
  title: string
}

export interface InteractiveReplyButtons {
  bodyText: string
  buttons: ReplyButton[]
}

export interface InteractiveReplyButtonsPayload extends WhatsAppBasePayload {
  type: "interactive"
  interactive: {
    type: "button"
    body: {
      text: string
    }
    action: {
      buttons: Array<{
        type: "reply"
        reply: ReplyButton
      }>
    }
  }
}

export type ButtonSets = {
  [key: string]: InteractiveReplyButtons
}

// ======================
// Text Message Types
// ======================
export interface TextMessage {
  body: string
}

export interface TextMessagePayload extends WhatsAppBasePayload {
  type: "text"
  text: {
    body: string
  }
}

export type MessageTemplates = {
  [key: string]: TextMessage
}

// ======================
// Image Message Types
// ======================
export interface Image {
  url: string
  caption: string
}

export interface ImagePayload extends WhatsAppBasePayload {
  type: "image"
  image: {
    link: string
    caption?: string
  }
}

export type ImageBundle = Image[]
export type ImageBundles = {
  [key: string]: ImageBundle
}

// ======================
// Interactive Flow Types
// ======================
export interface InteractiveFlowPayload {
  headerText?: string
  bodyText: string
  footerText?: string
  flowId: string
  flowCta: string
  screenId: string
  initialData?: Record<string, any>
}

// FIX: Made header/footer truly optional
export interface InteractiveFlowMessagePayload extends WhatsAppBasePayload {
  type: "interactive"
  interactive: {
    type: "flow"
    header?: {
      type: "text"
      text: string
    } | null
    body: {
      text: string
    }
    footer?: {
      text: string
    } | null
    action: {
      name: "flow"
      parameters: {
        flow_message_version: string
        flow_token: string
        flow_id: string
        flow_cta: string
        flow_action: "navigate"
        flow_action_payload: {
          screen: string
          data?: Record<string, any>
        }
      }
    }
  }
}

export type FlowTemplates = {
  [key: string]: InteractiveFlowPayload
}

// ======================
// Address Message Types
// ======================
export interface AddressParameters {
  country?: string
  state?: string
  city?: string
  street?: string
  zip?: string
}

export interface InteractiveAddress {
  type: "address"
  body: {
    text: string
  }
  action: {
    name: "address"
    parameters: AddressParameters
  }
  footer?: {
    text: string
  }
}

export interface InteractiveAddressPayload extends WhatsAppBasePayload {
  type: "interactive"
  interactive: InteractiveAddress
}

// ======================
// Audio Message Types
// ======================
export interface AudioPayload extends WhatsAppBasePayload {
  type: "audio"
  audio: {
    id?: string // For media ID
    link?: string // For public URL
  }
}

// ======================
// Contact Message Types
// ======================
export interface ContactName {
  formatted_name: string
  first_name?: string
  last_name?: string
  middle_name?: string
  suffix?: string
  prefix?: string
}

export interface ContactPhone {
  phone: string
  type?: "CELL" | "MAIN" | "IPHONE" | "HOME" | "WORK"
  wa_id?: string
}

export interface ContactEmail {
  email?: string
  type?: "WORK" | "HOME"
}

export interface ContactUrl {
  url?: string
  type?: "WORK" | "HOME"
}

export interface ContactAddress {
  street?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  country_code?: string
  type?: "WORK" | "HOME"
}

export interface ContactOrg {
  company?: string
  department?: string
  title?: string
}

export interface Contact {
  name: ContactName
  phones?: ContactPhone[]
  emails?: ContactEmail[]
  urls?: ContactUrl[]
  addresses?: ContactAddress[]
  org?: ContactOrg
  birthday?: string // YYYY-MM-DD
}

export interface ContactsPayload extends WhatsAppBasePayload {
  type: "contacts"
  contacts: Contact[]
}

// ======================
// Document Message Types
// ======================
export interface DocumentPayload extends WhatsAppBasePayload {
  type: "document"
  document: {
    id?: string // For media ID
    link?: string // For public URL
    caption?: string
    filename?: string
  }
}

// ======================
// Location Request Message Types
// ======================
export interface LocationRequestMessage {
  type: "location_request_message"
  body: {
    text: string
  }
  action: {
    name: "send_location"
  }
}

export interface LocationRequestPayload extends WhatsAppBasePayload {
  type: "interactive"
  interactive: LocationRequestMessage
}

// ======================
// Location Message Types
// ======================
export interface Location {
  longitude: number
  latitude: number
  name?: string
  address?: string
}

export interface LocationPayload extends WhatsAppBasePayload {
  type: "location"
  location: Location
}

// ======================
// Video Message Types
// ======================
export interface VideoPayload extends WhatsAppBasePayload {
  type: "video"
  video: {
    link: string // Public URL
    caption?: string
  }
}

// ======================
// Template Message Types
// ======================
export interface TemplateComponent {
  type: "header" | "body" | "button"
  parameters?: Array<{
    type: "text" | "currency" | "date_time" | "image" | "video" | "document"
    text?: string
    currency?: {
      fallback_value: string
      code: string
      amount_1000: number
    }
    date_time?: {
      fallback_value: string
    }
    image?: {
      link: string
    }
    video?: {
      link: string
    }
    document?: {
      link: string
      filename?: string
    }
  }>
  sub_type?: "url" | "quick_reply"
  index?: number
}

export interface TemplateLanguage {
  policy: "deterministic" | "fallback"
  code: string
}

export interface TemplateMessagePayload extends WhatsAppBasePayload {
  type: "template"
  template: {
    name: string
    language: TemplateLanguage
    components?: TemplateComponent[]
  }
}

// ======================
// Full Message Payload Union
// ======================
export type WhatsAppPayload =
  | InteractiveListPayload
  | InteractiveReplyButtonsPayload
  | TextMessagePayload
  | ImagePayload
  | InteractiveFlowMessagePayload
  | InteractiveAddressPayload
  | AudioPayload
  | ContactsPayload
  | DocumentPayload
  | LocationRequestPayload
  | LocationPayload
  | VideoPayload
  | TemplateMessagePayload // Add TemplateMessagePayload to the union
