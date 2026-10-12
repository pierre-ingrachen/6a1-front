import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, input } from "@angular/core"
import { Slot } from "game/models/game.model"
import { positionLabel, positionName } from "game/utils/position-labels"
import { groupSlotsByLine } from "game/utils/slot-layout"

@Component({
  selector: "squad-board",
  standalone: true,
  templateUrl: "./squad-board.component.html",
  styleUrls: ["./squad-board.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SquadBoardComponent {
  readonly slots = input.required<Slot[]>()
  readonly highlightedSlots = input<number[]>([])
  readonly selectedSlot = input<number | null>(null)
  readonly moveTargets = input<number[]>([])
  @Output() readonly slotClicked = new EventEmitter<number>()
  readonly rows = computed(() => groupSlotsByLine(this.slots()))

  readonly label = positionLabel
  readonly name = positionName

  isTarget(slot: Slot): boolean {
    return this.moveTargets().includes(slot.index)
  }

  isHighlighted(slot: Slot): boolean {
    return this.highlightedSlots().includes(slot.index)
  }
}
