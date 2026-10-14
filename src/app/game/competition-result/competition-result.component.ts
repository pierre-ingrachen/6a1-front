import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, input } from "@angular/core"
import { CompetitionResult } from "game/models/competition.model"
import { CompetitionRecapComponent } from "game/competition-recap/competition-recap.component"
import { MatchStep } from "game/models/simulation.model"
import { outcomeMessage } from "game/utils/outcome-message"

@Component({
  selector: "competition-result",
  standalone: true,
  imports: [CompetitionRecapComponent],
  templateUrl: "./competition-result.component.html",
  styleUrls: ["./competition-result.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompetitionResultComponent {
  readonly result = input.required<CompetitionResult>()
  readonly steps = input.required<MatchStep[]>()
  @Output() readonly replayRequested = new EventEmitter<void>()

  readonly message = computed(() => outcomeMessage(this.result().outcome))
  readonly groupSteps = computed(() => this.steps().filter((step) => step.match.round === "GROUP_STAGE"))
  readonly knockoutSteps = computed(() => this.steps().filter((step) => step.match.round !== "GROUP_STAGE"))
}
