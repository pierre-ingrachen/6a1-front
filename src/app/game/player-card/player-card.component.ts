import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, input } from "@angular/core"
import { DrawPlayer, PickCommand, Slot } from "game/models/game.model"
import { positionLabel, positionName } from "game/utils/position-labels"
import { slotChoicesOf } from "game/utils/slot-choices"

@Component({
  selector: "player-card",
  standalone: true,
  templateUrl: "./player-card.component.html",
  styleUrls: ["./player-card.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerCardComponent {
  readonly player = input.required<DrawPlayer>()
  readonly slots = input.required<Slot[]>()
  readonly disabled = input(false)
  readonly selected = input(false)
  @Output() readonly playerSelected = new EventEmitter<DrawPlayer>()

  readonly choices = computed(() => slotChoicesOf(this.player(), this.slots()))
  readonly selectable = computed(() => !this.player().alreadyPicked && this.choices().length > 0)

  readonly name = positionName
  readonly label = positionLabel
}
