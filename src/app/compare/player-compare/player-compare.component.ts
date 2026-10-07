import { Component, OnInit } from "@angular/core"
import { ActivatedRoute, ParamMap, Params, Router } from "@angular/router"
import { catchError, forkJoin, map, Observable, of, switchMap, tap } from "rxjs"
import { Season } from "models/season.model"
import { PlayerSearchResult } from "models/player-search-result.model"
import { PlayerStat, PlayerStats } from "models/player-stats.model"
import { SeasonService } from "services/season.service"
import { PlayerService } from "services/player.service"

export type StatMode = "total" | "per90"

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

interface Selection {
  season: number
  firstPlayerId: number | null
  secondPlayerId: number | null
}

export interface PlayerSlot {
  player: PlayerStats | null
  missing: boolean
}

@Component({
  selector: "player-compare",
  templateUrl: "./player-compare.component.html",
  styleUrls: ["./player-compare.component.scss"],
})
export class PlayerCompareComponent implements OnInit {
  readonly positionLabels: Partial<Record<string, string>> = {
    Forward: "Attaquant",
    Midfielder: "Milieu",
    Defender: "Défenseur",
    Goalkeeper: "Gardien",
  }

  seasons: Season[] = []
  selectedSeason: number | null = null
  firstSlot: PlayerSlot = { player: null, missing: false }
  secondSlot: PlayerSlot = { player: null, missing: false }
  categories: CategoryComparison[] = []
  mode: StatMode = "total"

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private seasonService: SeasonService,
    private playerService: PlayerService,
  ) {}

  ngOnInit() {
    this.seasonService
      .findAllSeasons()
      .pipe(
        tap((seasons) => (this.seasons = seasons)),
        switchMap((seasons) => this.route.queryParamMap.pipe(switchMap((params) => this.loadSelection(params, seasons)))),
      )
      .subscribe(([firstSlot, secondSlot]) => {
        this.firstSlot = firstSlot
        this.secondSlot = secondSlot
        this.categories = this.compare(firstSlot.player, secondSlot.player)
      })
  }

  selectSeason(season: number) {
    this.updateUrl({ season, p1: null, p2: null })
  }

  selectFirstPlayer(player: PlayerSearchResult) {
    this.updateUrl({ p1: player.id })
  }

  selectSecondPlayer(player: PlayerSearchResult) {
    this.updateUrl({ p2: player.id })
  }

  private loadSelection(params: ParamMap, seasons: Season[]): Observable<[PlayerSlot, PlayerSlot]> {
    const selection = this.toSelection(params, seasons)
    if (!selection) {
      return of([this.emptySlot(), this.emptySlot()])
    }
    this.selectedSeason = selection.season
    if (!params.has("season")) {
      this.updateUrl({ season: selection.season }, true)
    }
    return forkJoin([
      this.loadSlot(selection.firstPlayerId, selection.season),
      this.loadSlot(selection.secondPlayerId, selection.season),
    ])
  }

  private toSelection(params: ParamMap, seasons: Season[]): Selection | null {
    const [latestSeason] = seasons
    const season = Number(params.get("season")) || latestSeason?.startYear
    if (!season) {
      return null
    }
    return {
      season,
      firstPlayerId: Number(params.get("p1")) || null,
      secondPlayerId: Number(params.get("p2")) || null,
    }
  }

  private loadSlot(playerId: number | null, season: number): Observable<PlayerSlot> {
    if (playerId === null) {
      return of(this.emptySlot())
    }
    return this.playerService.findPlayerStats(playerId, season).pipe(
      map((player) => ({ player, missing: false })),
      catchError(() => of({ player: null, missing: true })),
    )
  }

  private emptySlot(): PlayerSlot {
    return { player: null, missing: false }
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

  private updateUrl(queryParams: Params, replaceUrl = false) {
    this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: "merge", replaceUrl })
  }
}
