import { ChangeDetectionStrategy, Component, input } from "@angular/core"
import { TopScorer } from "game/utils/top-scorer"

@Component({
  selector: "top-scorer-card",
  standalone: true,
  templateUrl: "./top-scorer-card.component.html",
  styleUrls: ["./top-scorer-card.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopScorerCardComponent {
  readonly scorer = input.required<TopScorer | null>()
}
