import { ChangeDetectionStrategy, Component, input } from "@angular/core"
import { GroupStageResult } from "game/models/competition.model"
import { GroupTableComponent } from "game/group-table/group-table.component"
import { MatchSummaryCardComponent } from "game/match-summary-card/match-summary-card.component"
import { MatchStep } from "game/models/simulation.model"

@Component({
  selector: "competition-recap",
  standalone: true,
  imports: [GroupTableComponent, MatchSummaryCardComponent],
  templateUrl: "./competition-recap.component.html",
  styleUrls: ["./competition-recap.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompetitionRecapComponent {
  readonly groupMatches = input.required<MatchStep[]>()
  readonly knockoutMatches = input.required<MatchStep[]>()
  readonly groupStage = input<GroupStageResult | null>(null)
}
