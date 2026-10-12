import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"
import { MatchResult } from "game/models/competition.model"

@Component({
  selector: "match-row",
  standalone: true,
  templateUrl: "./match-row.component.html",
  styleUrls: ["./match-row.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchRowComponent {
  readonly match = input.required<MatchResult>()
  readonly hasPenalties = computed(() => this.match().penaltiesFor !== null)
  readonly verdict = computed(() => {
    const { goalsFor, goalsAgainst, won } = this.match()
    if (goalsFor === goalsAgainst && !this.hasPenalties()) {
      return "draw"
    }
    return won ? "win" : "loss"
  })
}
