import { Component, EventEmitter, Input, Output } from "@angular/core"
import { FormControl } from "@angular/forms"
import { debounceTime, distinctUntilChanged, filter, map, of, switchMap } from "rxjs"
import { PlayerSearchResult } from "models/player-search-result.model"
import { PlayerService } from "services/player.service"

const MINIMUM_QUERY_LENGTH = 2
const SEARCH_DEBOUNCE_MS = 300

@Component({
  selector: "player-search",
  templateUrl: "./player-search.component.html",
  styleUrls: ["./player-search.component.scss"],
})
export class PlayerSearchComponent {
  @Input({ required: true }) inputId!: string
  @Input({ required: true }) label!: string
  @Input() set selectedName(name: string | null | undefined) {
    this.searchControl.setValue(name ?? "", { emitEvent: false })
  }
  @Output() playerSelected = new EventEmitter<PlayerSearchResult>()

  searchControl = new FormControl<string | PlayerSearchResult>("", { nonNullable: true })

  results$ = this.searchControl.valueChanges.pipe(
    filter((value): value is string => typeof value === "string"),
    map((query) => query.trim()),
    debounceTime(SEARCH_DEBOUNCE_MS),
    distinctUntilChanged(),
    switchMap((query) =>
      query.length >= MINIMUM_QUERY_LENGTH ? this.playerService.searchPlayers(query) : of([]),
    ),
  )

  constructor(private playerService: PlayerService) {}

  displayPlayer(player: PlayerSearchResult | string): string {
    return typeof player === "string" ? player : player.name
  }
}
