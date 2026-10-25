import { ChangeDetectionStrategy, Component, EventEmitter, input, Output } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { PlayerSearchComponent } from "compare/player-search/player-search.component"
import { PlayerSearchResult } from "models/player-search-result.model"
import { SeasonOption } from "models/season.model"

@Component({
  selector: "player-picker",
  standalone: true,
  imports: [FormsModule, PlayerSearchComponent],
  templateUrl: "./player-picker.component.html",
  styleUrls: ["./player-picker.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerPickerComponent {
  readonly inputId = input.required<string>()
  readonly label = input.required<string>()
  readonly seasons = input<SeasonOption[]>([])
  readonly selectedSeason = input<number | null>(null)
  readonly selectedName = input<string | null | undefined>(null)
  readonly hasPlayer = input(false)
  @Output() playerSelected = new EventEmitter<PlayerSearchResult>()
  @Output() seasonSelected = new EventEmitter<number>()
}
