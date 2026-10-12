import { Slot } from "game/models/game.model"

export const moveTargetsOf = (slots: Slot[], fromIndex: number | null): number[] => {
  const moved = slots.find((slot) => slot.index === fromIndex)?.player
  const source = slots.find((slot) => slot.index === fromIndex)
  if (!moved || !source) {
    return []
  }
  return slots
    .filter((slot) => slot.index !== fromIndex)
    .filter((slot) => moved.positions.includes(slot.position))
    .filter((slot) => !slot.player || slot.player.positions.includes(source.position))
    .map((slot) => slot.index)
}
