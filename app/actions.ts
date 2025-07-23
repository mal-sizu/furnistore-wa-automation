"use server"

import { revalidatePath } from "next/cache"
import { promises as fs } from "fs"
import path from "path"
import type { AllPresets, MessagePresetType, Flow, Preset } from "@/lib/types" // Import Flow and Preset type

// Define the directory where preset data will be stored
const DATA_DIR = path.join(process.cwd(), "data")
const FLOWS_DIR = path.join(process.cwd(), "data", "flows") // New directory for flows
const ACTIVE_FLOW_FILE = path.join(DATA_DIR, "active-flow.json") // File to store active flow ID

// Initial mock data (used only if a file doesn't exist yet)
const initialMockData: AllPresets = {
  text: {
    welcome: {
      body: "Hello! Welcome to our service. How can I help you today? 😊",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
    },
    goodbye: {
      body: "Thank to you for visiting. Have a great day! 👋",
      createdAt: "2024-01-16T11:00:00Z",
      updatedAt: "2024-01-16T11:00:00Z",
    },
    errorMessage: {
      body: "Sorry, something went wrong. Please try again later.",
      createdAt: "2024-01-17T12:00:00Z",
      updatedAt: "2024-01-17T12:00:00Z",
    },
  },
  address: {
    colombo_delivery: {
      bodyText: "Please provide your delivery address in Colombo:",
      addressParams: { country: "Sri Lanka", state: "Western Province", city: "Colombo" },
      footerText: "We deliver within 24 hours in Colombo",
      createdAt: "2024-02-01T09:00:00Z",
      updatedAt: "2024-02-01T09:00:00Z",
    },
    kandy_delivery: {
      bodyText: "Please provide your delivery address in Kandy:",
      addressParams: { country: "Sri Lanka", state: "Central Province", city: "Kandy" },
      footerText: "We deliver within 48 hours in Kandy",
      createdAt: "2024-02-02T10:00:00Z",
      updatedAt: "2024-02-02T10:00:00Z",
    },
    galle_delivery: {
      bodyText: "Please provide your delivery address in Galle:",
      addressParams: { country: "Sri Lanka", state: "Southern Province", city: "Galle" },
      createdAt: "2024-02-03T11:00:00Z",
      updatedAt: "2024-02-03T11:00:00Z",
    },
    island_wide: {
      bodyText: "Please provide your full delivery address:",
      addressParams: { country: "Sri Lanka" },
      footerText: "We deliver island-wide within 3-5 business days",
      createdAt: "2024-02-04T12:00:00Z",
      updatedAt: "2024-02-04T12:00:00Z",
    },
  },
  audio: {
    welcome_audio: {
      url: "https://example.com/audios/welcome.mp3",
      createdAt: "2024-03-01T13:00:00Z",
      updatedAt: "2024-03-01T13:00:00Z",
    },
    order_confirmation: {
      url: "https://example.com/audios/order-confirmed.mp3",
      createdAt: "2024-03-02T14:00:00Z",
      updatedAt: "2024-03-02T14:00:00Z",
    },
    shipping_info: {
      url: "https://example.com/audios/shipping-info.mp3",
      createdAt: "2024-03-03T15:00:00Z",
      updatedAt: "2024-03-03T15:00:00Z",
    },
    return_policy: {
      url: "https://example.com/audios/return-policy.mp3",
      createdAt: "2024-03-04T16:00:00Z",
      updatedAt: "2024-03-04T16:00:00Z",
    },
  },
  contacts: {}, // Will be populated by user
  document: {}, // Will be populated by user
  image: {
    catalogue: [
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/37.png?raw=true",
        caption:
          "CATALOGUE\n\nHi! Welcome to Furnistore!\n\nඅඩුවට තියෙන බාල මෙලමයින් අල්මාරි වලින් එහා යමක් සාදාරණ ගානට ඔයත් හොයනවද? ඔයාගෙ අල්මාරියත් මෙතන ඇති👇\n\nOur Wardrobe collection: \n\n👑   5 YEARS WARRANTY \n🛠   Made with high grade melamine. \n🟡   12 mm Thickness\n\n💸 CASH ON DELIVERY \n🚛 Island wide delivery \n\n🟡 different designs \n\n2 Door | 3 Door | 4 Door\n- With drawers\n- Without drawres \n- 2 drawer types \n- With mirror \n- Without mirrors \n\n🟡 different colors of your choice\n- Teak Brown \n- White \n- American Ash\n- Black",
      },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/36.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/39.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/40.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/34.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/35.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/42.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/32.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/33.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/30.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/31.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/38.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/23.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/25.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/27.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/26.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/29.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/24.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/28.png?raw=true", caption: "" },
    ],
    cupboards: [
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/cupboards%2Fsamples/WhatsApp%20Image%202025-07-04%20at%2023.57.38_87f91f1f.jpg?raw=true",
        caption: "",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/cupboards%2Fsamples/WhatsApp%20Image%202025-07-04%20at%2023.57.39_e7ce01f4.jpg?raw=true",
        caption: "",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/cupboards%2Fsamples/WhatsApp%20Image%202025-07-04%20at%2023.57.39_8df61a09.jpg?raw=true",
        caption: "",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/cupboards%2Fsamples/WhatsApp%20Image%202025-07-04%20at%2023.57.40_d844ba3e.jpg?raw=true",
        caption: "",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/cupboards%2Fsamples/WhatsApp%20Image%202025-07-04%20at%2023.57.40_66e0c565.jpg?raw=true",
        caption: "Samples",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/cupboards%2Fsamples/WhatsApp%20Image%202025-07-04%20at%2023.57.40_83ff6c4b.jpg?raw=true",
        caption: "",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/cupboards%2Fsamples/WhatsApp%20Image%202025-07-04%20at%2023.57.41_45a83cf8.jpg?raw=true",
        caption: "",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/cupboards%2Fsamples/WhatsApp%20Image%202025-07-04%20at%2023.57.41_b7a25e7a.jpg?raw=true",
        caption: "",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/cupboards%2Fsamples/WhatsApp%20Image%202025-07-04%20at%2023.57.42_9f15abf2.jpg?raw=true",
        caption: "",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/cupboards%2Fsamples/WhatsApp%20Image%202025-07-04%20at%2023.57.42_a35aa222.jpg?raw=true",
        caption: "",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/cupboards%2Fsamples/WhatsApp%20Image%202025-07-04%20at%2023.57.42_b51616d7.jpg?raw=true",
        caption: "",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/cupboards%2Fsamples/WhatsApp%20Image%202025-07-04%20at%2023.57.43_cbf8eb65.jpg?raw=true",
        caption: "",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/cupboards%2Fsamples/WhatsApp%20Image%202025-07-04%20at%2023.57.43_f787c501.jpg?raw=true",
        caption: "",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/cupboards%2Fsamples/WhatsApp%20Image%202025-07-04%20at%2023.57.44_399430b5.jpg?raw=true",
        caption: "",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/cupboards%2Fsamples/WhatsApp%20Image%202025-07-04%20at%2023.57.44_54e5d694.jpg?raw=true",
        caption: "",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/cupboards%2Fsamples/WhatsApp%20Image%202025-07-04%20at%2023.57.44_fb0aadd9.jpg?raw=true",
        caption: "",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/cupboards%2Fsamples/WhatsApp%20Image%202025-07-04%20at%2023.57.45_13349e6c.jpg?raw=true",
        caption: "",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/cupboards%2Fsamples/WhatsApp%20Image%202025-07-04%20at%2023.57.45_23914712.jpg?raw=true",
        caption: "",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/cupboards%2Fsamples/WhatsApp%20Image%202025-07-04%20at%2023.57.45_ad9d72a7.jpg?raw=true",
        caption: "",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/cupboards%2Fsamples/WhatsApp%20Image%202025-07-04%20at%2023.57.46_bf8ebefd.jpg?raw=true",
        caption: "",
      },
    ],
    "dressing-tables-cat": [
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/49.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/51.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/53.png?raw=true", caption: "" },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FdressingTables/WhatsApp%20Image%202025-07-05%20at%2002.57.30_b91cc33e.jpg?raw=true",
        caption: "Melamine Saree Dressing Table \n26,500/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FdressingTables/WhatsApp%20Image%202025-07-05%20at%2002.57.38_fe6ec23b.jpg?raw=true",
        caption: "Melamine Saree Dressing Table \n26,500/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FdressingTables/WhatsApp%20Image%202025-07-05%20at%2002.57.30_0f1369d9.jpg?raw=true",
        caption: "Melamine Saree Dressing Table \n26,500/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FdressingTables/WhatsApp%20Image%202025-07-05%20at%2002.57.46_0b21d8f3.jpg?raw=true",
        caption: "Melamine Saree Dressing Table \n26,500/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FdressingTables/WhatsApp%20Image%202025-07-05%20at%2002.57.36_bc5a2291.jpg?raw=true",
        caption: "Vanity Mirror\n31,500/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FdressingTables/WhatsApp%20Image%202025-07-05%20at%2002.57.37_39fe269c.jpg?raw=true",
        caption: "Vanity Mirror\n31,500/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FdressingTables/WhatsApp%20Image%202025-07-05%20at%2002.57.38_2b8f74d3.jpg?raw=true",
        caption: "Vanity Mirror\n31,500/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FdressingTables/WhatsApp%20Image%202025-07-05%20at%2002.57.38_6ba91597.jpg?raw=true",
        caption: "Vanity Mirror witth lockers\n37,500/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FdressingTables/WhatsApp%20Image%202025-07-05%20at%2002.57.37_1763e534.jpg?raw=true",
        caption: "Vanity Mirror witth lockers\n37,500/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FdressingTables/WhatsApp%20Image%202025-07-05%20at%2002.57.44_2037f367.jpg?raw=true",
        caption: "15,500/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FdressingTables/WhatsApp%20Image%202025-07-05%20at%2002.57.43_f5a7dab7.jpg?raw=true",
        caption: "17,000/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FdressingTables/WhatsApp%20Image%202025-07-05%20at%2002.57.45_c6fff9a2.jpg?raw=true",
        caption: "22,500/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FdressingTables/WhatsApp%20Image%202025-07-05%20at%2002.57.31_8021fd6d.jpg?raw=true",
        caption: "22,900/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FdressingTables/WhatsApp%20Image%202025-07-05%20at%2002.57.46_93a99b04.jpg?raw=true",
        caption: "22,900/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FdressingTables/WhatsApp%20Image%202025-07-05%20at%2002.57.46_992f3c77.jpg?raw=true",
        caption: "22,900/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FdressingTables/WhatsApp%20Image%202025-07-05%20at%2002.57.47_654f70d9.jpg?raw=true",
        caption: "Melamine Dressing Table \n23,900/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FdressingTables/WhatsApp%20Image%202025-07-05%20at%2002.57.43_d6cbb10c.jpg?raw=true",
        caption: "Melamine Dressing Table \n23,900/=(Any Color)",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FdressingTables/WhatsApp%20Image%202025-07-05%20at%2002.57.44_5b8e2b85.jpg?raw=true",
        caption: "Melamine Sliding Dressing Table \n23,900/=(Any Color)",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FdressingTables/WhatsApp%20Image%202025-07-05%20at%2002.57.45_8c66b16d.jpg?raw=true",
        caption: "26,900/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FdressingTables/WhatsApp%20Image%202025-07-05%20at%2002.57.29_3643f781.jpg?raw=true",
        caption: "27,900/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FdressingTables/WhatsApp%20Image%202025-07-05%20at%2002.57.30_a23dce4b.jpg?raw=true",
        caption: "27,500/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FdressingTables/WhatsApp%20Image%202025-07-05%20at%2002.57.31_c6602ecc.jpg?raw=true",
        caption: "31,000/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FdressingTables/WhatsApp%20Image%202025-07-05%20at%2002.57.33_357707c9.jpg?raw=true",
        caption: "31,000/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FdressingTables/WhatsApp%20Image%202025-07-05%20at%2002.57.28_806dbe90.jpg?raw=true",
        caption: "Hollywood Mirror Small\n39,990/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FdressingTables/WhatsApp%20Image%202025-07-05%20at%2002.57.29_4c5c2f45.jpg?raw=true",
        caption: "39,990/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FdressingTables/WhatsApp%20Image%202025-07-05%20at%2002.57.36_e7dce4b7.jpg?raw=true",
        caption: "39,990/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FdressingTables/WhatsApp%20Image%202025-07-05%20at%2002.57.29_efdb2dde.jpg?raw=true",
        caption: "Hollywood Mirror Large\n46,900/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FdressingTables/WhatsApp%20Image%202025-07-05%20at%2002.57.44_1a401090.jpg?raw=true",
        caption: "Hollywood Mirror Large\n46,900/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FdressingTables/WhatsApp%20Image%202025-07-05%20at%2002.57.45_ddcc5e58.jpg?raw=true",
        caption: "Hollywood Mirror Large\n46,900/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FdressingTables/WhatsApp%20Image%202025-07-05%20at%2002.57.33_47a5ed6a.jpg?raw=true",
        caption:
          "Melamine long drawers Wardrobe - 32,500/=\nBedside Cupboard - 9,900/=\nMelamine Saree Dressing Table = 26,500/=\n\n*Package Price = 65,900/=*",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FdressingTables/WhatsApp%20Image%202025-07-05%20at%2002.57.36_f746c8a4.jpg?raw=true",
        caption: "",
      },
    ],
    "beds-cat": [
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/8.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/9.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/12.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/13.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/14.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/15.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/16.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/17.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/18.png?raw=true", caption: "" },
    ],
    "mattress-cat": [
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/4.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/5.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/6.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/7.png?raw=true", caption: "" },
    ],
    "room-packages-cat": [
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/1.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/2.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/3.png?raw=true", caption: "" },
    ],
    tables: [
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/54.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/55.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/58.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/59.png?raw=true", caption: "" },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/60.png?raw=true",
        caption: "Writing Table \n- 4x2 : 14,500/=\n- 3x2 : 12,500/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FwritingTables/01wtbs001.jpg?raw=true",
        caption: "Writing Table \n- 4x2 : 14,500/=\n- 3x2 : 12,500/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FwritingTables/02wtbs002.jpg?raw=true",
        caption: "Writing Table \n- 4x2 : 14,500/=\n- 3x2 : 12,500/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FwritingTables/03wtb003.jpg?raw=true",
        caption: "Writing Table \n- 4x2 : 14,500/=\n- 3x2 : 12,500/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FwritingTables/04wtbl001.jpg?raw=true",
        caption: "Writing Table \n- 4x2 : 14,500/=\n- 3x2 : 12,500/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FwritingTables/05wtbl002.jpg?raw=true",
        caption: "Writing Table \n- 4x2 : 14,500/=\n- 3x2 : 12,500/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FwritingTables/06wtbl004.jpg?raw=true",
        caption: "Writing Table \n- 4x2 : 14,500/=\n- 3x2 : 12,500/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FwritingTables/07wtbl005.jpg?raw=true",
        caption: "Writing Table \n- 4x2 : 14,500/=\n- 3x2 : 12,500/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FwritingTables/08wt.jpg?raw=true",
        caption: "Metal Writing Table : 14,500/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FwritingTables/ctb001.jpg?raw=true",
        caption: "Melamine Cupboard Table\n21,500/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FwritingTables/ctb002.jpg?raw=true",
        caption: "Melamine Cupboard Table\n21,500/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FwritingTables/ctb003.jpg?raw=true",
        caption: "Melamine Cupboard Table\n21,500/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FwritingTables/ctb004.jpg?raw=true",
        caption: "Melamine Cupboard Table\n21,500/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FwritingTables/ctb005.jpg?raw=true",
        caption: "Melamine Cupboard Table\n21,500/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FwritingTables/ctb006.jpg?raw=true",
        caption: "Melamine Cupboard Table\n22,900/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FwritingTables/ctb007.jpg?raw=true",
        caption: "Melamine Cupboard Table\n22,900/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FwritingTables/ctb010.jpg?raw=true",
        caption: "Melamine Cupboard Table\n21,500/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FwritingTables/wtr001.jpg?raw=true",
        caption: "Melamine Table with Rack\n25,900/=",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/tables%2FwritingTables/wtr002.jpg?raw=true",
        caption: "Melamine Table with Rack\n25,900/=",
      },
    ],
    racks: [
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/racksNshelves%2FbookRacks/WhatsApp%20Image%202025-07-05%20at%2002.57.14_0b7ffedb.jpg?raw=true",
        caption: "Samples",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/racksNshelves%2FbookRacks/WhatsApp%20Image%202025-07-05%20at%2002.57.14_a5b0d868.jpg?raw=true",
        caption: "",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/racksNshelves%2FbookRacks/WhatsApp%20Image%202025-07-05%20at%2002.57.15_77ea1261.jpg?raw=true",
        caption: "",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/racksNshelves%2FbookRacks/WhatsApp%20Image%202025-07-05%20at%2002.57.16_7ff7235f.jpg?raw=true",
        caption: "",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/racksNshelves%2FbookRacks/WhatsApp%20Image%202025-07-05%20at%2002.57.16_b68f88cf.jpg?raw=true",
        caption: "",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/racksNshelves%2FbookRacks/WhatsApp%20Image%202025-07-05%20at%2002.57.17_97133ed6.jpg?raw=true",
        caption: "",
      },
    ],
    sofa: [],
    "iron-cupboards": [
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/others%2FironBoards/WhatsApp%20Image%202025-07-05%20at%2002.57.31_a1854d6a.jpg?raw=true",
        caption: "Samples",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/others%2FironBoards/WhatsApp%20Image%202025-07-05%20at%2002.57.32_c5f4c56a.jpg?raw=true",
        caption: "",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/others%2FironBoards/WhatsApp%20Image%202025-07-05%20at%2002.57.39_5decaeb8.jpg?raw=true",
        caption: "",
      },
      {
        url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/others%2FironBoards/WhatsApp%20Image%202025-07-05%20at%2002.57.39_937eff6a.jpg?raw=true",
        caption: "",
      },
    ],
    "divan-beds": [
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/10.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/11.png?raw=true", caption: "" },
    ],
    "pantry-cat": [
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/19.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/20.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/21.png?raw=true", caption: "" },
      { url: "https://github.com/mal-sizu/wa_funri_bot/blob/master/assets/catalogue/22.png?raw=true", caption: "" },
    ],
  },
  url_buttons: {}, // Will be populated by user
  flow: {
    userRegistration: {
      headerText: "Welcome to Furniture Haven!",
      bodyText: "Let's get you registered for a personalized shopping experience. Tap below to begin:",
      footerText: "Registration takes less than 2 minutes",
      flowId: "1234567890",
      flowCta: "Register Now",
      screenId: "registration_screen",
      initialData: { user_id: "123" },
      createdAt: "2024-04-01T17:00:00Z",
      updatedAt: "2024-04-01T17:00:00Z",
    },
    orderTracking: {
      headerText: "Track Your Order",
      bodyText: "Enter your order details to see real-time shipping updates:",
      footerText: "We deliver island-wide",
      flowId: "0987654321",
      flowCta: "Track Order",
      screenId: "tracking_screen",
      createdAt: "2024-04-02T18:00:00Z",
      updatedAt: "2024-04-02T18:00:00Z",
    },
    productCustomization: {
      bodyText: "Customize your furniture with our design tool:",
      flowId: "5647382910",
      flowCta: "Design Now",
      screenId: "customization_screen",
      initialData: { product_id: "wardrobe-123", material_options: ["teak", "melamine", "oak"] },
      createdAt: "2024-04-03T19:00:00Z",
      updatedAt: "2024-04-03T19:00:00Z",
    },
    customerSupport: {
      headerText: "Need Help?",
      bodyText: "Our support team is ready to assist you:",
      flowId: "1122334455",
      flowCta: "Chat Now",
      screenId: "support_screen",
      createdAt: "2024-04-04T20:00:00Z",
      updatedAt: "2024-04-04T20:00:00Z",
    },
  },
  list: {
    mainMenu: {
      type: "list",
      header: { type: "text", text: "Small Notice to our island wide trusted Customers:" },
      body: {
        text: "අපි මිල ඉතා සුළු ප්‍රමාණයක් වැඩි උසස් තත්වයක් නඩත්තු කරන  නිපැයුම්කරුවන් සමඟ පමණක් සම්බන්ද වන ආයතනයක්. තරමක් අඩු මිලට නිශ්පාදනය කරන නිපැයුම්කරුවන්ගෙ භාණ්ඩ වල පාරිභෝගික ගැටලු ඉහළ වීම ඊට හේතුවයි. එම මිලට ගෙන අවම මුදලට ලබාදීමෙන් ඉහළ විකිණුම් ප්‍රමාණයක් අපි අපේක්ශා කරනව. \n\nඉතින් මේ අපට ලබාදිය හැකි අවම මිල ගණන් වනවා සේම එවැනි විශේෂ මිලකට උසස් තත්වයෙ භාණ්ඩ ලබාගන්න ඔබට දැන් අවස්ථාවක් ලැබිල තියෙනව. \n\nWe are an organization that connects only with manufacturers who maintain high quality at a slightly higher price. The reason is that products from low-cost manufacturing tend to have more customer complaints. By offering these high-quality products at the lowest possible price, we aim to achieve higher sales volume.\n\nSo, you now have the opportunity to get high-quality products from us at the lowest price.\n\nSo, you now have the opportunity to get high-quality products from us at the lowest price.",
      },
      action: {
        button: "Search 🔍",
        sections: [
          {
            rows: [
              {
                id: "dressing-tables",
                title: "🪞 Dressing Tables",
                description: "තේක්ක සහ මෙලමයින් | Teak & Melamine models for your selection.",
              },
              {
                id: "beds",
                title: "🛏 Beds & Mattresses",
                description: "තේක්ක, ඇක්ටෝනියා ඇඳන් | Spring, Form & Hybrid mattresses",
              },
              {
                id: "room-packages",
                title: "📦 Bed Room Sets",
                description: "ඇඳ, කබඩ්, මේස සමඟ | Complete sets with bed, cupboard & table.",
              },
              {
                id: "tables",
                title: "🪑 Tables",
                description: "තේක්ක, මෙලමයින් මේස | Teak, Melamine, and other wooden tables.",
              },
              {
                id: "racks",
                title: "📚 Racks & Shelves",
                description: "මෙලමයින් රාක්ක මාදිලි | Stylish Melamine racks and shelves.",
              },
              {
                id: "sofa",
                title: "🛋 Sofa Sets | සෝෆා",
                description: "Modern & classic designs. Fabric & leather options. විවිධ මාදිලි.",
              },
              {
                id: "iron-cupboards",
                title: "🥌 Iron Cupboards | කබඩ්",
                description: "ශක්තිමත් සහ ආරක්ෂිතයි | Durable & secure storage. Multiple sizes.",
              },
              {
                id: "other-furniture",
                title: "🪄 වෙනත් | Other",
                description: "පුටු, ස්ටෑන්ඩ් සහ තවත් | Stools, stands, and more furniture.",
              },
            ],
          },
        ],
      },
      createdAt: "2024-05-01T08:00:00Z",
      updatedAt: "2024-05-01T08:00:00Z",
    },
    wardrobeMenu: {
      type: "list",
      header: { type: "text", text: "🚪Browse Wardrobes | අල්මාරි මාදිලි" },
      body: { text: "Browse your Wardrobe ✨\nඔබගේ සිතැඟි අල්මාරිය සොයාගන්න ✨" },
      action: {
        button: "Categories",
        sections: [
          {
            rows: [
              { id: "melamine-two-door", title: "2 Door | දොර 2", description: "" },
              { id: "melamine-three-door", title: "3 Door | දොර 3", description: "" },
              { id: "melamine-four-door", title: "4 Door | දොර 4", description: "" },
              { id: "steel-cupboards", title: "Steel Cupboards | වානේ අල්මාරි", description: "" },
              { id: "half-cupboards", title: "Half Cupboards | භාග අල්මාරි", description: "" },
              { id: "other-cupboards", title: "Others | වෙනත්", description: "" },
            ],
          },
        ],
      },
      createdAt: "2024-05-02T09:00:00Z",
      updatedAt: "2024-05-02T09:00:00Z",
    },
  },
  location_request: {
    store_locator: {
      bodyText: "Please share your location to find the nearest store:",
      createdAt: "2024-06-01T10:00:00Z",
      updatedAt: "2024-06-01T10:00:00Z",
    },
    delivery_location: {
      bodyText: "Please share your location for delivery estimation:",
      createdAt: "2024-06-02T11:00:00Z",
      updatedAt: "2024-06-02T11:00:00Z",
    },
    service_area: {
      bodyText: "Share your location to check if we service your area:",
      createdAt: "2024-06-03T12:00:00Z",
      updatedAt: "2024-06-03T12:00:00Z",
    },
    event_direction: {
      bodyText: "Share your location for directions to our event:",
      createdAt: "2024-06-04T13:00:00Z",
      updatedAt: "2024-06-04T13:00:00Z",
    },
  },
  reply_buttons: {
    confirmation: {
      bodyText: "Are you sure you want to proceed?",
      buttons: [
        { id: "confirm_yes", title: "✅ Yes" },
        { id: "confirm_no", title: "❌ No" },
      ],
      createdAt: "2024-07-01T14:00:00Z",
      updatedAt: "2024-07-01T14:00:00Z",
    },
    mainActions: {
      bodyText: "What would you like to do next?",
      buttons: [
        { id: "action_browse_products", title: "🛍️ Browse Products" },
        { id: "action_talk_to_agent", title: "🧑‍💼 Talk to an Agent" },
        { id: "action_view_offers", title: "🎉 View Offers" },
      ],
      createdAt: "2024-07-02T15:00:00Z",
      updatedAt: "2024-07-02T15:00:00Z",
    },
  },
  location: {}, // Will be populated by user
  video: {}, // Will be populated by user
}

// Helper function to get the file path for a given message type
function getPresetFilePath(type: MessagePresetType) {
  return path.join(DATA_DIR, `${type}.json`)
}

// Function to load all presets from JSON files
export async function loadAllPresets(): Promise<AllPresets> {
  const allPresets: AllPresets = {
    text: {},
    address: {},
    audio: {},
    contacts: {},
    document: {},
    image: {},
    url_buttons: {},
    flow: {},
    list: {},
    location_request: {},
    reply_buttons: {},
    location: {},
    video: {},
  }

  try {
    await fs.mkdir(DATA_DIR, { recursive: true }) // Ensure data directory exists

    const messageTypes: MessagePresetType[] = Object.keys(initialMockData) as MessagePresetType[]

    for (const type of messageTypes) {
      const filePath = getPresetFilePath(type)
      try {
        const fileContent = await fs.readFile(filePath, "utf-8")
        allPresets[type] = JSON.parse(fileContent)
      } catch (error: any) {
        if (error.code === "ENOENT") {
          // File does not exist, initialize with mock data and save it
          console.log(`Initializing ${type}.json with mock data.`)
          allPresets[type] = (initialMockData as any)[type] || {}
          await fs.writeFile(filePath, JSON.stringify(allPresets[type], null, 2), "utf-8")
        } else {
          console.error(`Error reading ${filePath}:`, error)
          // If there's another error, fall back to empty object for this type
          allPresets[type] = {}
        }
      }
    }
  } catch (error) {
    console.error("Error ensuring data directory exists or loading presets:", error)
  }

  console.log("Loaded all presets from file system.")
  return allPresets
}

// Function to save/update a preset to its corresponding JSON file
export async function savePreset(type: MessagePresetType, id: string, data: any): Promise<void> {
  console.log(`Saving preset: Type=${type}, ID=${id}`)
  const filePath = getPresetFilePath(type)

  try {
    await fs.mkdir(DATA_DIR, { recursive: true }) // Ensure data directory exists

    let currentPresetsOfType: { [key: string]: any } = {}
    try {
      const fileContent = await fs.readFile(filePath, "utf-8")
      currentPresetsOfType = JSON.parse(fileContent)
    } catch (error: any) {
      if (error.code === "ENOENT") {
        console.log(`File ${filePath} not found, creating new one.`)
      } else {
        console.error(`Error reading existing file ${filePath}:`, error)
        throw error // Re-throw to indicate failure
      }
    }

    // Add/update timestamps
    const now = new Date().toISOString()
    const presetToSave = {
      ...data,
      createdAt: currentPresetsOfType[id]?.createdAt || now, // Keep existing createdAt if editing
      updatedAt: now,
    }

    currentPresetsOfType[id] = presetToSave
    await fs.writeFile(filePath, JSON.stringify(currentPresetsOfType, null, 2), "utf-8")
    console.log(`Preset "${id}" of type "${type}" saved to ${filePath}.`)
    revalidatePath("/") // Revalidate the page to show updated data
  } catch (error) {
    console.error(`Failed to save preset "${id}" of type "${type}":`, error)
    throw error
  }
}

// Function to delete a preset from its corresponding JSON file
export async function deletePreset(type: MessagePresetType, id: string): Promise<void> {
  console.log(`Deleting preset: Type=${type}, ID=${id}`)
  const filePath = getPresetFilePath(type)

  try {
    let currentPresetsOfType: { [key: string]: any } = {}
    try {
      const fileContent = await fs.readFile(filePath, "utf-8")
      currentPresetsOfType = JSON.parse(fileContent)
    } catch (error: any) {
      if (error.code === "ENOENT") {
        console.log(`File ${filePath} not found, nothing to delete.`)
        return // File doesn't exist, so preset can't be there
      } else {
        console.error(`Error reading existing file ${filePath}:`, error)
        throw error
      }
    }

    if (currentPresetsOfType[id]) {
      delete currentPresetsOfType[id]
      await fs.writeFile(filePath, JSON.stringify(currentPresetsOfType, null, 2), "utf-8")
      console.log(`Preset "${id}" of type "${type}" deleted from ${filePath}.`)
      revalidatePath("/") // Revalidate the page to show updated data
    } else {
      console.log(`Preset "${id}" of type "${type}" not found in ${filePath}.`)
    }
  } catch (error) {
    console.error(`Failed to delete preset "${id}" of type "${type}":`, error)
    throw error
  }
}

// ======================
// Flow Persistence Actions
// ======================

// Helper function to get the file path for a given flow
function getFlowFilePath(flowId: string) {
  return path.join(FLOWS_DIR, `${flowId}.json`)
}

// Function to save a flow
export async function saveFlow(flowId: string, flow: Flow): Promise<void> {
  console.log(`Saving flow: ID=${flowId}`)
  const filePath = getFlowFilePath(flowId)

  try {
    await fs.mkdir(FLOWS_DIR, { recursive: true }) // Ensure flows directory exists
    await fs.writeFile(filePath, JSON.stringify(flow, null, 2), "utf-8")
    console.log(`Flow "${flowId}" saved to ${filePath}.`)
    revalidatePath("/playground") // Revalidate the playground page
    revalidatePath("/execute") // Revalidate the execute page
  } catch (error) {
    console.error(`Failed to save flow "${flowId}":`, error)
    throw error
  }
}

// Function to load a flow
export async function loadFlow(flowId: string): Promise<Flow | null> {
  console.log(`Loading flow: ID=${flowId}`)
  const filePath = getFlowFilePath(flowId)

  try {
    const fileContent = await fs.readFile(filePath, "utf-8")
    return JSON.parse(fileContent) as Flow
  } catch (error: any) {
    if (error.code === "ENOENT") {
      console.log(`Flow file ${filePath} not found.`)
      return null
    } else {
      console.error(`Error loading flow "${flowId}":`, error)
      throw error
    }
  }
}

// Function to load all available flow IDs
export async function loadAllFlows(): Promise<string[]> {
  console.log("Loading all flow IDs.")
  try {
    await fs.mkdir(FLOWS_DIR, { recursive: true }) // Ensure flows directory exists
    const files = await fs.readdir(FLOWS_DIR)
    return files.filter((file) => file.endsWith(".json")).map((file) => file.replace(".json", ""))
  } catch (error: any) {
    if (error.code === "ENOENT") {
      console.log("Flows directory not found, returning empty list.")
      return []
    }
    console.error("Error loading all flow IDs:", error)
    throw error
  }
}

// ======================
// Active Flow Management
// ======================

export async function setActiveFlow(flowId: string | null): Promise<void> {
  console.log(`Setting active flow to: ${flowId}`)
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    await fs.writeFile(ACTIVE_FLOW_FILE, JSON.stringify({ activeFlowId: flowId }, null, 2), "utf-8")
    revalidatePath("/playground")
    revalidatePath("/execute")
    console.log(`Active flow set to "${flowId}".`)
  } catch (error) {
    console.error(`Failed to set active flow to "${flowId}":`, error)
    throw error
  }
}

export async function getActiveFlowId(): Promise<string | null> {
  try {
    const fileContent = await fs.readFile(ACTIVE_FLOW_FILE, "utf-8")
    const data = JSON.parse(fileContent)
    return data.activeFlowId || null
  } catch (error: any) {
    if (error.code === "ENOENT") {
      console.log("No active flow file found, returning null.")
      return null
    }
    console.error("Error getting active flow ID:", error)
    return null
  }
}

// ======================
// Flow Execution Simulation
// ======================

export async function simulateFlowExecution(flowId: string): Promise<string[]> {
  console.log(`Simulating execution for flow: ${flowId}`)
  const log: string[] = []

  try {
    const flow = await loadFlow(flowId)
    if (!flow) {
      log.push(`Error: Flow "${flowId}" not found.`)
      return log
    }

    const allPresetsMap = await loadAllPresets()
    const allPresetsArray: Preset[] = Object.entries(allPresetsMap).flatMap(([type, presetsById]) =>
      Object.entries(presetsById).map(([id, data]) => ({
        id,
        type: type as MessagePresetType,
        data,
        createdAt: (data as any).createdAt || new Date().toISOString(),
        updatedAt: (data as any).updatedAt || new Date().toISOString(),
      })),
    )

    // Find the starting node (for simplicity, the first node in the array)
    let currentNode = flow.nodes[0]
    if (!currentNode) {
      log.push("Error: Flow has no nodes.")
      return log
    }

    let steps = 0
    const maxSteps = 10 // Prevent infinite loops for complex flows

    while (currentNode && steps < maxSteps) {
      const preset = allPresetsArray.find(
        (p) => p.id === currentNode.data.presetId && p.type === currentNode.data.presetType,
      )

      if (preset) {
        let messageContent = `[${preset.type.toUpperCase()}] `
        // Extract relevant content for logging based on type
        switch (preset.type) {
          case "text":
            messageContent += (preset.data as any).body
            break
          case "reply_buttons":
            messageContent +=
              (preset.data as any).bodyText +
              " (Buttons: " +
              (preset.data as any).buttons.map((b: any) => b.title).join(", ") +
              ")"
            break
          case "list":
            messageContent += (preset.data as any).body?.text + " (Button: " + (preset.data as any).action?.button + ")"
            break
          case "image":
            messageContent += `Image Bundle (${(preset.data as any).length} images)`
            break
          case "flow":
            messageContent += (preset.data as any).bodyText + ` (CTA: ${(preset.data as any).flowCta})`
            break
          default:
            messageContent += `Preset ID: ${preset.id}`
        }
        log.push(`Step ${steps + 1}: Sent message from node "${currentNode.data.presetId}" (${messageContent})`)
      } else {
        log.push(`Step ${steps + 1}: Sent message from unknown preset for node "${currentNode.data.presetId}"`)
      }

      // Find the next node to traverse. For this basic simulation, we'll just follow the first edge.
      const nextEdge = flow.edges.find((edge) => edge.source === currentNode?.id)

      if (nextEdge) {
        const nextNode = flow.nodes.find((node) => node.id === nextEdge.target)
        if (nextNode) {
          log.push(
            `  -> Followed edge (Condition: "${nextEdge.data?.condition || "default"}") to node "${nextNode.data.presetId}"`,
          )
          currentNode = nextNode
        } else {
          log.push(`  -> Edge points to non-existent node "${nextEdge.target}". Flow ends.`)
          currentNode = null // End flow
        }
      } else {
        log.push("  -> No outgoing edges. Flow ends.")
        currentNode = null // End flow
      }
      steps++
    }

    if (steps >= maxSteps) {
      log.push(`Simulation stopped after ${maxSteps} steps to prevent infinite loop.`)
    }
  } catch (error) {
    console.error(`Error during flow simulation for "${flowId}":`, error)
    log.push(`Error during simulation: ${(error as Error).message}`)
  }

  return log
}

// ======================
// Real Flow Execution Trigger
// ======================

export async function triggerFlowStart(
  flowId: string,
  recipientPhoneNumber: string,
): Promise<{ success: boolean; message: string }> {
  console.log(`Attempting to trigger real flow execution for flow: ${flowId} to ${recipientPhoneNumber}`)
  try {
    const response = await fetch("/api/whatsapp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ flowId, recipientPhoneNumber }),
    })

    const result = await response.json()

    if (response.ok) {
      console.log("Flow trigger successful:", result)
      return { success: true, message: result.message || "Flow triggered successfully!" }
    } else {
      console.error("Flow trigger failed:", result)
      return { success: false, message: result.error || "Failed to trigger flow." }
    }
  } catch (error) {
    console.error("Error triggering flow:", error)
    return { success: false, message: `Client-side error triggering flow: ${(error as Error).message}` }
  }
}
