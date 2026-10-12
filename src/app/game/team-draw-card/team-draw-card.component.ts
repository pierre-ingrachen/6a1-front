import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, input } from "@angular/core"
import { Draw, DrawPlayer, Line, Slot } from "game/models/game.model"
import { PlayerCardComponent } from "game/player-card/player-card.component"

const LINES_FROM_GOALKEEPER: Line[] = ["GOALKEEPER", "DEFENDER", "MIDFIELDER", "ATTACKER"]

const LINE_LABELS: Record<Line, string> = {
  GOALKEEPER: "Gardien",
  DEFENDER: "Défenseurs",
  MIDFIELDER: "Milieux",
  ATTACKER: "Attaquants",
}

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

  readonly groups = computed(() =>
    LINES_FROM_GOALKEEPER.map((line) => ({
      line,
      label: LINE_LABELS[line],
      players: this.draw()
        .players.filter((player) => player.line === line)
        .sort((first, second) => second.rating - first.rating),
    })).filter((group) => group.players.length > 0),
  )
}
