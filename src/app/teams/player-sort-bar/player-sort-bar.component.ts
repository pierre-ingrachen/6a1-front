import { ChangeDetectionStrategy, Component, EventEmitter, input, Output } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { defaultSortDirection, PLAYER_SORT_OPTIONS, PlayerSortKey, SortDirection } from "utils/player-sort"

@Component({
  selector: "player-sort-bar",
  standalone: true,
  imports: [FormsModule],
  templateUrl: "./player-sort-bar.component.html",
  styleUrls: ["./player-sort-bar.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerSortBarComponent {
  readonly sortKey = input<PlayerSortKey>("averageRating")
  readonly direction = input<SortDirection>("desc")
  readonly stacked = input(false)

  @Output() readonly sortKeyChange = new EventEmitter<PlayerSortKey>()
  @Output() readonly directionChange = new EventEmitter<SortDirection>()

  readonly sortOptions = PLAYER_SORT_OPTIONS

  selectSortKey(key: PlayerSortKey): void {
    this.sortKeyChange.emit(key)
    this.directionChange.emit(defaultSortDirection(key))
  }
}
