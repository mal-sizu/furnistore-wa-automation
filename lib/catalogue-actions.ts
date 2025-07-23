"use server"

import { promises as fs } from "fs"
import path from "path"
import type { CatalogueData, CatalogueItem } from "@/types/catalogue"

const CATALOGUE_FILE_PATH = path.join(process.cwd(), "data", "catalogue.json")

// Helper to read the catalogue data
async function readCatalogueFile(): Promise<CatalogueData> {
  try {
    const data = await fs.readFile(CATALOGUE_FILE_PATH, "utf8")
    return JSON.parse(data) as CatalogueData
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      // File not found, return empty array
      return []
    }
    console.error("Error reading catalogue file:", error)
    throw new Error("Failed to read catalogue data.")
  }
}

// Helper to write the catalogue data
async function writeCatalogueFile(data: CatalogueData): Promise<void> {
  try {
    await fs.writeFile(CATALOGUE_FILE_PATH, JSON.stringify(data, null, 2), "utf8")
  } catch (error) {
    console.error("Error writing catalogue file:", error)
    throw new Error("Failed to save catalogue data.")
  }
}

// Helper to generate ID from name
function generateIdFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
}

export async function getCatalogueItems(): Promise<CatalogueData> {
  return await readCatalogueFile()
}

export async function addOrUpdateCatalogueItem(item: CatalogueItem): Promise<CatalogueItem> {
  const currentData = await readCatalogueFile()
  const newId = generateIdFromName(item.name)

  let updatedItem: CatalogueItem

  const existingIndex = currentData.findIndex((cat) => cat.id === item.id)

  if (existingIndex > -1) {
    // Update existing item
    updatedItem = { ...item, id: item.id } // Keep existing ID
    currentData[existingIndex] = updatedItem
  } else {
    // Add new item
    // Ensure the new ID is unique, append a number if necessary
    let finalId = newId
    let counter = 1
    while (currentData.some((cat) => cat.id === finalId)) {
      finalId = `${newId}_${counter}`
      counter++
    }
    updatedItem = { ...item, id: finalId }
    currentData.push(updatedItem)
  }

  await writeCatalogueFile(currentData)
  return updatedItem
}

export async function deleteCatalogueItem(id: string): Promise<void> {
  const currentData = await readCatalogueFile()
  const filteredData = currentData.filter((item) => item.id !== id)

  if (filteredData.length === currentData.length) {
    throw new Error(`Catalogue item with ID '${id}' not found.`)
  }

  await writeCatalogueFile(filteredData)
}
