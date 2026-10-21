import { ChangeDetectionStrategy, Component, computed, EventEmitter, inject, Input, Output } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { FormControl, ReactiveFormsModule } from "@angular/forms"
import { MatAutocompleteModule } from "@angular/material/autocomplete"
import { debounceTime, distinctUntilChanged, filter, map, of, switchMap } from "rxjs"
import { PlayerSearchResult } from "models/player-search-result.model"
import { PlayerService } from "services/player.service"
import { idleState, toLoadState } from "utils/load-state"

const MINIMUM_QUERY_LENGTH = 2
const SEARCH_DEBOUNCE_MS = 300

@Component({
  selector: "player-search",
  standalone: true,
  imports: [ReactiveFormsModule, MatAutocompleteModule],
  templateUrl: "./player-search.component.html",
  styleUrls: ["./player-search.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerSearchComponent {
  private readonly playerService = inject(PlayerService)

  @Input({ required: true }) inputId!: string
  @Input({ required: true }) label!: string
  @Input() set selectedName(name: string | null | undefined) {
    this.searchControl.setValue(name ?? "", { emitEvent: false })
  }
  @Output() playerSelected = new EventEmitter<PlayerSearchResult>()

  readonly searchControl = new FormControl<string | PlayerSearchResult>("", { nonNullable: true })

  private readonly searchState = toSignal(
    this.searchControl.valueChanges.pipe(
      filter((value): value is string => typeof value === "string"),
      map((query) => query.trim()),
      debounceTime(SEARCH_DEBOUNCE_MS),
      distinctUntilChanged(),
      switchMap((query) =>
        query.length >= MINIMUM_QUERY_LENGTH
          ? toLoadState(this.playerService.searchPlayers(query), [] as PlayerSearchResult[])
          : of(idleState([] as PlayerSearchResult[])),
      ),
    ),
    { initialValue: idleState([] as PlayerSearchResult[]) },
  )

  readonly results = computed(() => this.searchState().data)
  readonly searchFailed = computed(() => this.searchState().status === "error")

  displayPlayer(player: PlayerSearchResult | string): string {
    return typeof player === "string" ? player : player.name
  }
}
