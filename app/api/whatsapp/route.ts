import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { 
  sendWhatsAppTemplateMessage,
  sendWhatsAppCatalogueItem,
  sendTextMessage 
} from "./whatsapp.service"
import catalogue from "@/data/catalogue.json"
import { CatalogueItem } from "@/types/catalogue"

// Environment variables for webhook verification
const VERIFY_TOKEN = process.env.VERIFY_TOKEN
const ACCESS_TOKEN = process.env.ACCESS_TOKEN
const APP_SECRET = process.env.META_APP_SECRET 

/**
 * Handles GET requests for webhook verification.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WhatsApp Webhook verified successfully!")
    return new NextResponse(challenge, { status: 200 })
  } else {
    console.error("WhatsApp Webhook verification failed: Token mismatch or invalid mode.")
    return new NextResponse("Verification token mismatch or invalid mode", { status: 403 })
  }
}

/**
 * Handles POST requests for incoming WhatsApp messages and status updates.
 */
export async function POST(request: NextRequest) {
  // --- Read raw body & headers ---
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!signature || !APP_SECRET) {
    console.error("Missing X-Hub-Signature-256 header or APP_SECRET environment variable.");
    return new NextResponse("Unauthorized: Missing signature or app secret", { status: 401 });
  }

  // --- Verify Webhook Signature ---
  try {
    const hash = crypto
      .createHmac("sha256", APP_SECRET)
      .update(rawBody)
      .digest("hex");

    const expectedSignature = `sha256=${hash}`;

    if (signature !== expectedSignature) {
      console.error("Webhook signature mismatch. Request might be tampered with.");
      return new NextResponse("Forbidden: Invalid signature", { status: 403 });
    }

    // --- Parse Webhook Payload ---
    const data = JSON.parse(rawBody);
    console.log("✅ Received WhatsApp webhook payload:", JSON.stringify(data, null, 2));

    // --- Process Incoming Webhook Events ---
    if (data.entry && data.entry[0] && data.entry[0].changes && data.entry[0].changes[0]) {
      const change = data.entry[0].changes[0];

      if (change.field === "messages") {
        // 📩 Handle incoming messages from users
        const message = change.value.messages?.[0];
        if (message) {
          const senderWaId = message.from; // WhatsApp ID of the sender
          console.log(`Incoming message from ${senderWaId}:`);

          // Handle text messages
          if (message.type === "text") {
            console.log(`  Text: ${message.text.body}`);

            // Send welcome template first
            try {
              await sendWhatsAppTemplateMessage(senderWaId, "welcome_01", 'en');
              console.log(`✅ Sent 'welcome_01' template to ${senderWaId}`);
            } catch (templateError) {
              console.error(`❌ Failed to send template:`, templateError);
            }

            // Send main_menu_1 catalogue
            try {
              const mainMenu = catalogue.find(item => item.id === "main_menu_1") as CatalogueItem;
              if (mainMenu) {
                await sendWhatsAppCatalogueItem(mainMenu, senderWaId);
                console.log(`✅ Sent 'main_menu_1' to ${senderWaId}`);
              } else {
                console.warn("Main menu catalogue not found");
              }
            } catch (catalogueError) {
              console.error(`❌ Failed to send catalogue:`, catalogueError);
            }
          } 
          // Handle interactive messages
          else if (message.type === "interactive") {
            console.log(`  Interactive message received.`);

            if (message.interactive.type === "button_reply") {
              const buttonId = message.interactive.button_reply.id;
              console.log(`    Button Reply: ID=${buttonId}`);

              // Handle button actions from main_menu_1
              switch(buttonId) {
                case "place_order":
                  await sendTextMessage(senderWaId, "Please send your order details including products and quantities!");
                  break;
                case "delivery_fee":
                  await sendTextMessage(senderWaId, "Please send your location to calculate delivery fee");
                  break;
                default:
                  console.log(`Unknown button clicked: ${buttonId}`);
                  await sendTextMessage(senderWaId, "Sorry, I didn't understand that option. Please try again.");
              }
            } 
            else if (message.interactive.type === "list_reply") {
              const listId = message.interactive.list_reply.id;
              console.log(`    List Reply: ID=${listId}`);

              // Handle list selections from main_menu_1
              switch(listId) {
                case "dressing-tables":
                  const dressingTables = catalogue.find(item => item.id === "dressing_tables") as CatalogueItem;
                  if (dressingTables) {
                    await sendWhatsAppCatalogueItem(dressingTables, senderWaId);
                  }
                  break;
                case "beds":
                  await sendTextMessage(senderWaId, "Here are our bed options...");
                  // Add actual catalogue implementation
                  break;
                case "room-packages":

                  const roomPackage = catalogue.find(item => item.id === "room_package") as CatalogueItem;
                  if (roomPackage) {
                    await sendWhatsAppCatalogueItem(roomPackage, senderWaId);
                  }
                  break;
                default:
                  console.log(`Unknown list selection: ${listId}`);
                  await sendTextMessage(senderWaId, "Please select a valid option");
              }
            }
          }
          // Add more message types as needed
        }
      } else if (change.field === "message_status") {
        // Handle message delivery/read status updates
        const status = change.value.statuses?.[0];
        if (status) {
          console.log(
            `Message ID ${status.id} status update: ${status.status} at ${new Date(
              status.timestamp * 1000
            ).toISOString()}`
          );
          // TODO: Update your DB with message status
        }
      }
      // Add more change fields as needed
    }

    // Always respond with 200 OK to acknowledge the webhook
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("❌ Error handling WhatsApp webhook:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}