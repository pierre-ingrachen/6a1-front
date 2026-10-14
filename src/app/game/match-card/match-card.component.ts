import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"
import { GoalSide, MatchStep } from "game/models/simulation.model"
import { REGULAR_TIME } from "game/utils/match-timeline"

const GOAL_HIGHLIGHT_MINUTES = 3

@Component({
  selector: "match-card",
  standalone: true,
  templateUrl: "./match-card.component.html",
  styleUrls: ["./match-card.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchCardComponent {
  readonly step = input.required<MatchStep>()
  readonly minute = input.required<number>()

  readonly visibleGoals = computed(() => this.step().goals.filter((goal) => goal.minute <= this.minute()))
  readonly goalsFor = computed(() => this.visibleGoals().filter((goal) => goal.side === "FOR").length)
  readonly goalsAgainst = computed(() => this.visibleGoals().filter((goal) => goal.side === "AGAINST").length)
  readonly finished = computed(() => this.minute() >= this.step().duration)
  readonly inExtraTime = computed(() => this.minute() > REGULAR_TIME)
  readonly goalJustScored = computed(() =>
    this.visibleGoals().some((goal) => this.minute() - goal.minute < GOAL_HIGHLIGHT_MINUTES),
  )
  readonly hasPenalties = computed(() => this.step().match.penaltiesFor !== null)
  readonly displayedMinute = computed(() => Math.min(this.minute(), this.step().duration))

  goalsOf(side: GoalSide) {
    return this.visibleGoals().filter((goal) => goal.side === side)
  }
}
