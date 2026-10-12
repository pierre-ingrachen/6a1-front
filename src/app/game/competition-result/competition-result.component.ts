import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, input } from "@angular/core"
import { CompetitionResult } from "game/models/competition.model"
import { GroupTableComponent } from "game/group-table/group-table.component"
import { MatchRowComponent } from "game/match-row/match-row.component"
import { outcomeMessage } from "game/utils/outcome-message"
import { roundLabel } from "game/utils/position-labels"

@Component({
  selector: "competition-result",
  standalone: true,
  imports: [GroupTableComponent, MatchRowComponent],
  templateUrl: "./competition-result.component.html",
  styleUrls: ["./competition-result.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompetitionResultComponent {
  readonly result = input.required<CompetitionResult>()
  @Output() readonly replayRequested = new EventEmitter<void>()

  readonly message = computed(() => outcomeMessage(this.result().outcome))
  readonly roundLabel = roundLabel
}
