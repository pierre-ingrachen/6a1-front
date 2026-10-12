import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, input } from "@angular/core"
import { Draw, DrawPlayer, Line, Slot } from "game/models/game.model"
import { PlayerCardComponent } from "game/player-card/player-card.component"

@Component({
  selector: "team-draw-card",
  standalone: true,
  imports: [PlayerCardComponent],
  templateUrl: "./team-draw-card.component.html",
  styleUrls: ["./team-draw-card.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamDrawCardComponent {
  readonly draw = input.required<Draw>()
  readonly slots = input.required<Slot[]>()
  readonly disabled = input(false)
  @Output() readonly playerSelected = new EventEmitter<DrawPlayer>()

  private readonly lineOrder: Record<Line, number> = {
    ATTACKER: 0,
    MIDFIELDER: 1,
    DEFENDER: 2,
    GOALKEEPER: 3,
  }

  readonly players = computed(() =>
    [...this.draw().players].sort((first, second) => this.lineOrder[first.line] - this.lineOrder[second.line]),
  )
}
