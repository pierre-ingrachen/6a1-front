import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"
import { GoalListComponent } from "game/goal-list/goal-list.component"
import { MatchStep } from "game/models/simulation.model"
import { ShootoutPanelComponent } from "game/shootout-panel/shootout-panel.component"
import { REGULAR_TIME } from "game/utils/match-timeline"

const GOAL_HIGHLIGHT_MINUTES = 3

@Component({
  selector: "match-card",
  standalone: true,
  imports: [GoalListComponent, ShootoutPanelComponent],
  templateUrl: "./match-card.component.html",
  styleUrls: ["./match-card.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchCardComponent {
  readonly step = input.required<MatchStep>()
  readonly minute = input.required<number>()
  readonly kicksRevealed = input(0)

  readonly visibleGoals = computed(() => this.step().goals.filter((goal) => goal.minute <= this.minute()))
  readonly goalsFor = computed(() => this.visibleGoals().filter((goal) => goal.side === "FOR").length)
  readonly goalsAgainst = computed(() => this.visibleGoals().filter((goal) => goal.side === "AGAINST").length)
  readonly regularTimeOver = computed(() => this.minute() >= this.step().duration)
  readonly hasShootout = computed(() => this.step().shootout.length > 0)
  readonly shootoutStarted = computed(() => this.hasShootout() && this.regularTimeOver())
  readonly finished = computed(
    () => this.regularTimeOver() && this.kicksRevealed() >= this.step().shootout.length,
  )
  readonly inExtraTime = computed(() => this.minute() > REGULAR_TIME)
  readonly goalJustScored = computed(() =>
    this.visibleGoals().some((goal) => this.minute() - goal.minute < GOAL_HIGHLIGHT_MINUTES),
  )
  readonly displayedMinute = computed(() => Math.min(this.minute(), this.step().duration))
}
