import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, input } from "@angular/core"
import { BenchListComponent } from "game/bench-list/bench-list.component"
import { surname } from "game/utils/surname"
import { Draw, DrawPlayer, Line, Slot } from "game/models/game.model"

const LINES_FROM_GOALKEEPER: Line[] = ["GOALKEEPER", "DEFENDER", "MIDFIELDER", "ATTACKER"]

@Component({
  selector: "team-draw-card",
  standalone: true,
  imports: [BenchListComponent],
  templateUrl: "./team-draw-card.component.html",
  styleUrls: ["./team-draw-card.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamDrawCardComponent {
  readonly draw = input.required<Draw>()
  readonly slots = input.required<Slot[]>()
  readonly disabled = input(false)
  readonly selectedPlayerId = input<number | null>(null)
  @Output() readonly playerSelected = new EventEmitter<DrawPlayer>()

  readonly orderedPlayers = computed(() =>
    LINES_FROM_GOALKEEPER.flatMap((line) =>
      this.draw()
        .players.filter((player) => player.line === line)
        .sort((first, second) => surname(first.name).localeCompare(surname(second.name), "fr", { sensitivity: "base" })),
    ),
  )
}
