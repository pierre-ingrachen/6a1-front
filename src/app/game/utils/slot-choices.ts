import { DrawPlayer, Slot } from "game/models/game.model"

export interface SlotChoice {
  position: string
  slotIndex: number
}

export const slotChoicesOf = (player: DrawPlayer, slots: Slot[]): SlotChoice[] => {
  const choices = player.eligibleSlots
    .map((slotIndex) => slots.find((slot) => slot.index === slotIndex))
    .filter((slot): slot is Slot => slot !== undefined)
    .map((slot) => ({ position: slot.position, slotIndex: slot.index }))
  return choices.filter((choice, index) => choices.findIndex((other) => other.position === choice.position) === index)
}
