"use server"

import type { CatalogueItem } from "@/types/catalogue"
import type {
  Image,
  InteractiveList,
  InteractiveReplyButtons,
  TextMessage,
  WhatsAppPayload,
  TemplateMessagePayload,
  AudioPayload,
  VideoPayload,
  DocumentPayload,
  Location,
  Contact,
  InteractiveAddress,
  LocationRequestMessage,
  InteractiveFlowMessagePayload,
} from "@/types/whatsapp"

// Environment variables
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID
const ACCESS_TOKEN = process.env.ACCESS_TOKEN
const API_VERSION = 'v23.0'

if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
  console.warn("WhatsApp API environment variables are not set. WhatsApp message sending will not work.")
}

const WHATSAPP_API_URL = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`

/**
 * Sends a payload to WhatsApp API
 * @param payload The WhatsApp API message payload
 */
async function sendWhatsAppPayload(payload: WhatsAppPayload) {
  if (!ACCESS_TOKEN) {
    throw new Error("WhatsApp Access Token is not configured.")
  }

  const response = await fetch(WHATSAPP_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error("WhatsApp API Error:", errorData)
    throw new Error(
      `Failed to send WhatsApp message: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`,
    )
  }

  return response.json()
}

// ======================
// Core Message Functions
// ======================

export async function sendTextMessage(recipientWaId: string, text: string) {
  const payload: WhatsAppPayload = {
    messaging_product: "whatsapp",
    to: recipientWaId,
    type: "text",
    text: { body: text },
  }
  return sendWhatsAppPayload(payload)
}

export async function sendImageMessage(
  recipientWaId: string,
  imageUrl: string,
  caption?: string
) {
  const payload: WhatsAppPayload = {
    messaging_product: "whatsapp",
    to: recipientWaId,
    type: "image",
    image: {
      link: imageUrl,
      caption,
    },
  }
  return sendWhatsAppPayload(payload)
}

export async function sendInteractiveList(
  recipientWaId: string,
  list: InteractiveList
) {
  const payload: WhatsAppPayload = {
    messaging_product: "whatsapp",
    to: recipientWaId,
    type: "interactive",
    interactive: {
      type: "list",
      header: list.header,
      body: list.body,
      action: list.action,
    },
  }
  return sendWhatsAppPayload(payload)
}

export async function sendInteractiveButtons(
  recipientWaId: string,
  buttons: InteractiveReplyButtons
) {
  const payload: WhatsAppPayload = {
    messaging_product: "whatsapp",
    to: recipientWaId,
    type: "interactive",
    interactive: {
      type: "button",
      body: {
        text: buttons.bodyText,
      },
      action: {
        buttons: buttons.buttons.map((btn) => ({
          type: "reply",
          reply: {
            id: btn.id,
            title: btn.title,
          },
        })),
      },
    },
  }
  return sendWhatsAppPayload(payload)
}

export async function sendAudioMessage(
  recipientWaId: string,
  audioUrl: string
) {
  const payload: AudioPayload = {
    messaging_product: "whatsapp",
    to: recipientWaId,
    type: "audio",
    audio: { link: audioUrl },
  }
  return sendWhatsAppPayload(payload)
}

export async function sendVideoMessage(
  recipientWaId: string,
  videoUrl: string,
  caption?: string
) {
  const payload: VideoPayload = {
    messaging_product: "whatsapp",
    to: recipientWaId,
    type: "video",
    video: {
      link: videoUrl,
      caption,
    },
  }
  return sendWhatsAppPayload(payload)
}

export async function sendDocumentMessage(
  recipientWaId: string,
  documentUrl: string,
  filename?: string,
  caption?: string
) {
  const payload: DocumentPayload = {
    messaging_product: "whatsapp",
    to: recipientWaId,
    type: "document",
    document: {
      link: documentUrl,
      filename,
      caption,
    },
  }
  return sendWhatsAppPayload(payload)
}

export async function sendLocationMessage(
  recipientWaId: string,
  location: Location
) {
  const payload: WhatsAppPayload = {
    messaging_product: "whatsapp",
    to: recipientWaId,
    type: "location",
    location,
  }
  return sendWhatsAppPayload(payload)
}

export async function sendContactMessage(
  recipientWaId: string,
  contacts: Contact[]
) {
  const payload: WhatsAppPayload = {
    messaging_product: "whatsapp",
    to: recipientWaId,
    type: "contacts",
    contacts,
  }
  return sendWhatsAppPayload(payload)
}

export async function sendAddressMessage(
  recipientWaId: string,
  address: InteractiveAddress
) {
  const payload: WhatsAppPayload = {
    messaging_product: "whatsapp",
    to: recipientWaId,
    type: "interactive",
    interactive: address,
  }
  return sendWhatsAppPayload(payload)
}

export async function sendLocationRequest(
  recipientWaId: string,
  request: LocationRequestMessage
) {
  const payload: WhatsAppPayload = {
    messaging_product: "whatsapp",
    to: recipientWaId,
    type: "interactive",
    interactive: request,
  }
  return sendWhatsAppPayload(payload)
}

export async function sendInteractiveFlow(
  recipientWaId: string,
  flow: InteractiveFlowMessagePayload['interactive']
) {
  const payload: InteractiveFlowMessagePayload = {
    messaging_product: "whatsapp",
    to: recipientWaId,
    type: "interactive",
    interactive: flow,
  }
  return sendWhatsAppPayload(payload)
}

/**
 * Sends a WhatsApp template message
 */
export async function sendWhatsAppTemplateMessage(
  recipientWaId: string,
  templateName: string,
  languageCode = "en_US",
  components?: TemplateMessagePayload["template"]["components"],
) {
  const payload: TemplateMessagePayload = {
    messaging_product: "whatsapp",
    to: recipientWaId,
    type: "template",
    template: {
      name: templateName,
      language: {
        policy: "deterministic",
        code: languageCode,
      },
      ...(components && { components }),
    },
  }
  return sendWhatsAppPayload(payload)
}

// ======================
// Catalogue Item Handler
// ======================

/**
 * Sends a catalogue item's messages
 */
export async function sendWhatsAppCatalogueItem(item: CatalogueItem, recipientWaId: string): Promise<void> {
  for (const message of item.messages) {
    switch (message.type) {
      case "text":
        await sendTextMessage(recipientWaId, message.content.body)
        break
      
      case "image_bundle":
        for (const img of message.content) {
          await sendImageMessage(recipientWaId, img.url, img.caption)
        }
        break
      
      case "interactive_list":
        await sendInteractiveList(recipientWaId, message.content)
        break
      
      case "interactive_buttons":
        await sendInteractiveButtons(recipientWaId, message.content)
        break
      
      // Add other message types as needed
      default:
        // @ts-ignore
        console.warn(`Unsupported message type: ${message.type}`)
    }
    // Add small delay between messages
    await new Promise(resolve => setTimeout(resolve, 300))
  }
  console.log(`✅ Sent catalogue item '${item.name}' to ${recipientWaId}`)
}