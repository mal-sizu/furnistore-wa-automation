import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRichText(text: string): string {
  if (!text) return ""
  // Bold: **text**
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
  // Italic: __text__
  formattedText = formattedText.replace(/__(.*?)__/g, "<em>$1</em>")
  // Bullet points: - item
  const lines = formattedText.split("\n")
  let inList = false
  const processedLines = lines.map((line) => {
    if (line.startsWith("- ")) {
      if (!inList) {
        inList = true
        return `<ul><li>${line.substring(2)}</li>`
      }
      return `<li>${line.substring(2)}</li>`
    } else {
      if (inList) {
        inList = false
        return `</ul><p>${line}</p>`
      }
      return `<p>${line}</p>`
    }
  })
  if (inList) {
    processedLines.push("</ul>")
  }
  return processedLines.join("")
}