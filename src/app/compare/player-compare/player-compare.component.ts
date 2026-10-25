import { DecimalPipe, NgTemplateOutlet } from "@angular/common"
import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core"
import { toObservable, toSignal } from "@angular/core/rxjs-interop"
import { MatButtonToggleModule } from "@angular/material/button-toggle"
import { MatIconModule } from "@angular/material/icon"
import { ActivatedRoute, ParamMap, Params, Router, RouterLink } from "@angular/router"
import { catchError, forkJoin, map, Observable, of, switchMap } from "rxjs"
import { PlayerPickerComponent } from "compare/player-picker/player-picker.component"
import { StatRowComponent } from "compare/stat-row/stat-row.component"
import { PlayerSearchResult } from "models/player-search-result.model"
import { PlayerStat, PlayerStats } from "models/player-stats.model"
import { StatMode } from "models/stat-mode.model"
import { Season, SeasonOption } from "models/season.model"
import { PlayerService } from "services/player.service"
import { SeasonService } from "services/season.service"
import { loadingState, toLoadState } from "utils/load-state"
import { playerPositionLabel } from "utils/position-label"
import { ratingLevel } from "utils/rating"

export interface StatComparison {
  key: string
  label: string
  lowerIsBetter: boolean
  first: PlayerStat | null
  second: PlayerStat | null
}

export interface CategoryComparison {
  key: string
  label: string
  mainStats: StatComparison[]
  detailStats: StatComparison[]
}

interface SlotSelection {
  playerId: number | null
  season: number | null
}

export interface PlayerSlot {
  player: PlayerStats | null
  missing: boolean
}

const EMPTY_SLOT: PlayerSlot = { player: null, missing: false }
const NO_SLOTS: [PlayerSlot, PlayerSlot] = [EMPTY_SLOT, EMPTY_SLOT]

@Component({
  selector: "player-compare",
  standalone: true,
  imports: [
    PlayerPickerComponent,
    StatRowComponent,
    MatButtonToggleModule,
    MatIconModule,
    NgTemplateOutlet,
    DecimalPipe,
    RouterLink,
  ],
  templateUrl: "./player-compare.component.html",
  styleUrls: ["./player-compare.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerCompareComponent {
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly seasonService = inject(SeasonService)
  private readonly playerService = inject(PlayerService)

  readonly ratingLevel = ratingLevel
  readonly positionLabel = playerPositionLabel

  readonly mode = signal<StatMode>("total")

  private readonly seasonsState = toSignal(toLoadState(this.seasonService.findAllSeasons(), [] as Season[]), {
    initialValue: loadingState([] as Season[]),
  })
  private readonly queryParams = toSignal(this.route.queryParamMap, { requireSync: true })
  private readonly firstSeasonOptions = signal<SeasonOption[]>([])
  private readonly secondSeasonOptions = signal<SeasonOption[]>([])

  readonly seasons = computed(() => this.seasonsState().data)
  readonly seasonsFailed = computed(() => this.seasonsState().status === "error")
  readonly firstSeasons = computed(() =>
    this.firstSeasonOptions().length ? this.firstSeasonOptions() : this.seasons(),
  )
  readonly secondSeasons = computed(() =>
    this.secondSeasonOptions().length ? this.secondSeasonOptions() : this.seasons(),
  )

  private readonly selection = computed(() => ({
    first: this.toSlotSelection(this.queryParams(), "p1", "s1"),
    second: this.toSlotSelection(this.queryParams(), "p2", "s2"),
  }))
  readonly firstPlayerId = computed(() => this.selection().first.playerId)
  readonly secondPlayerId = computed(() => this.selection().second.playerId)
  readonly firstSeason = computed(() => this.selection().first.season)
  readonly secondSeason = computed(() => this.selection().second.season)

  private readonly slots = toSignal(
    toObservable(computed(() => (this.seasonsState().status === "loaded" ? this.selection() : null))).pipe(
      switchMap((selection) =>
        selection === null ? of(NO_SLOTS) : forkJoin([this.loadSlot(selection.first), this.loadSlot(selection.second)]),
      ),
    ),
    { initialValue: NO_SLOTS },
  )

  readonly firstSlot = computed(() => this.slots()[0])
  readonly secondSlot = computed(() => this.slots()[1])
  readonly categories = computed(() => this.compare(this.firstSlot().player, this.secondSlot().player))

  selectFirstPlayer(player: PlayerSearchResult): void {
    this.firstSeasonOptions.set(this.seasonsOf(player))
    this.updateUrl({ p1: player.id, s1: this.defaultSeason(player, this.firstSeason()) })
  }

  selectFirstSeason(season: number): void {
    this.updateUrl({ s1: season })
  }

  selectSecondPlayer(player: PlayerSearchResult): void {
    this.secondSeasonOptions.set(this.seasonsOf(player))
    this.updateUrl({ p2: player.id, s2: this.defaultSeason(player, this.secondSeason()) })
  }

  selectSecondSeason(season: number): void {
    this.updateUrl({ s2: season })
  }

  private seasonsOf(player: PlayerSearchResult): SeasonOption[] {
    return this.seasons()
      .map((season) => ({
        ...season,
        teamName: player.seasons.find((played) => played.startYear === season.startYear)?.teamName,
      }))
      .filter((season) => season.teamName !== undefined)
  }

  private defaultSeason(player: PlayerSearchResult, currentSeason: number | null): number {
    return player.seasons.some((played) => played.startYear === currentSeason) && currentSeason !== null
      ? currentSeason
      : player.seasons[0].startYear
  }

  private toSlotSelection(params: ParamMap, playerKey: string, seasonKey: string): SlotSelection {
    return {
      playerId: Number(params.get(playerKey)) || null,
      season: Number(params.get(seasonKey)) || null,
    }
  }

  private loadSlot({ playerId, season }: SlotSelection): Observable<PlayerSlot> {
    if (playerId === null || season === null) {
      return of(EMPTY_SLOT)
    }
    return this.playerService.findPlayerStats(playerId, season).pipe(
      map((player) => ({ player, missing: false })),
      catchError(() => of({ player: null, missing: true })),
    )
  }

  private compare(first: PlayerStats | null, second: PlayerStats | null): CategoryComparison[] {
    const reference = first ?? second
    if (!reference) {
      return []
    }
    const firstStats = this.indexStats(first)
    const secondStats = this.indexStats(second)
    return reference.categories
      .map((category) => {
        const rows = category.stats.map((stat) => ({
          key: stat.key,
          label: stat.label,
          detail: stat.detail,
          lowerIsBetter: stat.lowerIsBetter,
          first: firstStats.get(stat.key) ?? null,
          second: secondStats.get(stat.key) ?? null,
        }))
        return {
          key: category.key,
          label: category.label,
          mainStats: rows.filter((row) => !row.detail),
          detailStats: rows.filter((row) => row.detail),
          hasValues: rows.some((row) => row.first?.total.value != null || row.second?.total.value != null),
        }
      })
      .filter((category) => category.hasValues)
      .map(({ key, label, mainStats, detailStats }) => ({ key, label, mainStats, detailStats }))
  }

  private indexStats(player: PlayerStats | null): Map<string, PlayerStat> {
    const stats = player?.categories.flatMap((category) => category.stats) ?? []
    return new Map(stats.map((stat) => [stat.key, stat]))
  }

  private updateUrl(queryParams: Params): void {
    this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: "merge" })
  }
}
