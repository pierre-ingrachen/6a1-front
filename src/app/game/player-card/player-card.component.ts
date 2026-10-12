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
  @Output() readonly picked = new EventEmitter<PickCommand>()

  readonly choices = computed(() => slotChoicesOf(this.player(), this.slots()))
  readonly selectable = computed(() => this.choices().length > 0)

  readonly label = positionLabel
  readonly name = positionName

  pick(slotIndex: number): void {
    this.picked.emit({ playerId: this.player().playerId, slotIndex })
  }
}
