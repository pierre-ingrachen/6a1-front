import { ChangeDetectionStrategy, Component, computed, input, signal } from "@angular/core"
import { GoalListComponent } from "game/goal-list/goal-list.component"
import { MatchStep } from "game/models/simulation.model"
import { ShootoutPanelComponent } from "game/shootout-panel/shootout-panel.component"

@Component({
  selector: "match-summary-card",
  standalone: true,
  imports: [GoalListComponent, ShootoutPanelComponent],
  templateUrl: "./match-summary-card.component.html",
  styleUrls: ["./match-summary-card.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchSummaryCardComponent {
  readonly step = input.required<MatchStep>()
  readonly expanded = signal(false)

  readonly hasShootout = computed(() => this.step().shootout.length > 0)
  readonly verdict = computed(() => {
    const { goalsFor, goalsAgainst, won } = this.step().match
    if (goalsFor === goalsAgainst && !this.hasShootout()) {
      return "draw"
    }
    return won ? "win" : "loss"
  })

  toggle(): void {
    this.expanded.update((expanded) => !expanded)
  }
}
