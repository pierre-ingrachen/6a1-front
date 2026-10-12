import { ChangeDetectionStrategy, Component, EventEmitter, Output, input } from "@angular/core"
import { Draw, PickCommand, Slot } from "game/models/game.model"
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
  @Output() readonly picked = new EventEmitter<PickCommand>()
}
