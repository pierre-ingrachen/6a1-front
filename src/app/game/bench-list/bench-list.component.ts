import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, input } from "@angular/core"
import { DrawPlayer, Slot } from "game/models/game.model"
import { positionLabel, positionName } from "game/utils/position-labels"
import { slotChoicesOf } from "game/utils/slot-choices"
import { surname } from "game/utils/surname"
import { UclBackdropComponent } from "shared/ucl-backdrop/ucl-backdrop.component"

@Component({
  selector: "app-bench-list",
  standalone: true,
  imports: [UclBackdropComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./bench-list.component.html",
  styleUrl: "./bench-list.component.scss",
})
export class BenchListComponent {
  readonly players = input.required<DrawPlayer[]>()
  readonly slots = input.required<Slot[]>()
  readonly disabled = input(false)
  readonly selectedPlayerId = input<number | null>(null)
  readonly stadium = input<string | null>(null)
  @Output() readonly playerSelected = new EventEmitter<DrawPlayer>()

  protected readonly rows = computed(() =>
    this.players().map((player) => ({
      player,
      surname: surname(player.name),
      positions: player.positions.map(positionLabel).join(", "),
      positionNames: player.positions.map(positionName).join(", "),
      selectable: !player.alreadyPicked && slotChoicesOf(player, this.slots()).length > 0,
    })),
  )
}
