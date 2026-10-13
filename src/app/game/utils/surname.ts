const PARTICLES = new Set(["de", "da", "di", "do", "dos", "del", "van", "von", "der", "den", "le", "la", "el", "ter", "ten", "al"])

export const surname = (fullName: string): string => {
  const words = fullName.trim().split(/\s+/)
  let start = words.length - 1
  while (start > 0 && PARTICLES.has(words[start - 1].toLowerCase())) {
    start--
  }
  return words.slice(start).join(" ")
}
