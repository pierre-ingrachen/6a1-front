import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, input } from "@angular/core"
import { Slot } from "game/models/game.model"
import { pitchPointsOf } from "game/utils/formation-layout"
import { positionLabel, positionName } from "game/utils/position-labels"

@Component({
  selector: "squad-board",
  standalone: true,
  templateUrl: "./squad-board.component.html",
  styleUrls: ["./squad-board.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SquadBoardComponent {
  readonly slots = input.required<Slot[]>()
  readonly formation = input("")
  readonly highlightedSlots = input<number[]>([])
  readonly selectedSlot = input<number | null>(null)
  readonly moveTargets = input<number[]>([])
  readonly drawTargets = input<number[]>([])
  readonly selectingDrawPlayer = input(false)
  @Output() readonly slotClicked = new EventEmitter<number>()
  readonly points = computed(() => pitchPointsOf(this.formation(), this.slots()))

  readonly label = positionLabel

  isTarget(slot: Slot): boolean {
    return this.moveTargets().includes(slot.index) || this.drawTargets().includes(slot.index)
  }

  isDrawTarget(slot: Slot): boolean {
    return this.drawTargets().includes(slot.index)
  }

  isDisabled(slot: Slot): boolean {
    if (this.selectingDrawPlayer()) {
      return !this.isDrawTarget(slot)
    }
    return !slot.player && !this.moveTargets().includes(slot.index)
  }

  isHighlighted(slot: Slot): boolean {
    return this.highlightedSlots().includes(slot.index)
  }

  titleOf(slot: Slot): string {
    const position = positionName(slot.position)
    return slot.player ? `${position} : ${slot.player.name} (${slot.player.teamName} ${slot.player.seasonLabel})` : position
  }
}
