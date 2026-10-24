const positionLabels: Readonly<Record<string, string>> = {
  Forward: "Attaquant",
  Midfielder: "Milieu",
  Defender: "Défenseur",
  Goalkeeper: "Gardien",
}

export function playerPositionLabel(position: string): string {
  return Object.prototype.hasOwnProperty.call(positionLabels, position) ? positionLabels[position] : position
}
