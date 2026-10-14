import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"
import { GoalEvent } from "game/models/simulation.model"

@Component({
  selector: "goal-list",
  standalone: true,
  templateUrl: "./goal-list.component.html",
  styleUrls: ["./goal-list.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalListComponent {
  readonly goals = input.required<GoalEvent[]>()
  readonly opponentName = input.required<string>()

  readonly goalsFor = computed(() => this.goals().filter((goal) => goal.side === "FOR"))
  readonly goalsAgainst = computed(() => this.goals().filter((goal) => goal.side === "AGAINST"))
}
