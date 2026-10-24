import { DecimalPipe } from "@angular/common"
import { ChangeDetectionStrategy, Component, input } from "@angular/core"
import { RouterLink } from "@angular/router"
import { Player } from "models/player.model"
import { playerPositionLabel } from "utils/position-label"
import { ratingLevel } from "utils/rating"

@Component({
  selector: "player-card",
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: "./player-card.component.html",
  styleUrls: ["./player-card.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerCardComponent {
  readonly player = input.required<Player>()
  readonly season = input<number | null>(null)
  readonly compact = input(false)

  readonly ratingLevel = ratingLevel
  readonly positionLabel = playerPositionLabel
}
