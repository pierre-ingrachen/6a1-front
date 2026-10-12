import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, input } from "@angular/core"
import { Slot } from "game/models/game.model"
import { positionLabel, positionName } from "game/utils/position-labels"
import { placeSlots, shortName } from "game/utils/slot-placement"
import { assignJerseyNumbers } from "lineup/utils/jersey-numbers"
import { JerseyComponent } from "lineup/jersey/jersey.component"
import { PitchLinesComponent } from "lineup/pitch-lines/pitch-lines.component"

@Component({
  selector: "squad-board",
  standalone: true,
  imports: [JerseyComponent, PitchLinesComponent],
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
  readonly placedSlots = computed(() => placeSlots(this.slots(), this.formation()))
  readonly jerseyNumbers = computed(() => {
    const placed = this.placedSlots()
    const numbers = assignJerseyNumbers(placed.map(({ slot }) => slot.position))
    return new Map(placed.map(({ slot }, index) => [slot.index, numbers[index]]))
  })

  readonly label = positionLabel
  readonly name = positionName
  readonly shortName = shortName

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
}
