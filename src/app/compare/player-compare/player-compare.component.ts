import { Component, OnInit } from "@angular/core"
import { ActivatedRoute, ParamMap, Params, Router } from "@angular/router"
import { catchError, forkJoin, map, Observable, of, switchMap, tap } from "rxjs"
import { Season, SeasonOption } from "models/season.model"
import { PlayerSearchResult } from "models/player-search-result.model"
import { PlayerStat, PlayerStats } from "models/player-stats.model"
import { ratingLevel } from "utils/rating"
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

interface SlotSelection {
  playerId: number | null
  season: number | null
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
  readonly ratingLevel = ratingLevel
  readonly positionLabels: Partial<Record<string, string>> = {
    Forward: "Attaquant",
    Midfielder: "Milieu",
    Defender: "Défenseur",
    Goalkeeper: "Gardien",
  }

  seasons: Season[] = []
  firstSeason: number | null = null
  secondSeason: number | null = null
  firstSeasons: SeasonOption[] = []
  secondSeasons: SeasonOption[] = []
  firstPlayerId: number | null = null
  secondPlayerId: number | null = null
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
        switchMap(() => this.route.queryParamMap.pipe(switchMap((params) => this.loadSelection(params)))),
      )
      .subscribe(([firstSlot, secondSlot]) => {
        this.firstSlot = firstSlot
        this.secondSlot = secondSlot
        this.categories = this.compare(firstSlot.player, secondSlot.player)
      })
  }

  selectFirstPlayer(player: PlayerSearchResult) {
    this.firstSeasons = this.seasonsOf(player)
    this.updateUrl({ p1: player.id, s1: this.defaultSeason(player, this.firstSeason) })
  }

  selectFirstSeason(season: number) {
    this.updateUrl({ s1: season })
  }

  selectSecondPlayer(player: PlayerSearchResult) {
    this.secondSeasons = this.seasonsOf(player)
    this.updateUrl({ p2: player.id, s2: this.defaultSeason(player, this.secondSeason) })
  }

  selectSecondSeason(season: number) {
    this.updateUrl({ s2: season })
  }

  private seasonsOf(player: PlayerSearchResult): SeasonOption[] {
    return this.seasons
      .map((season) => ({ ...season, teamName: player.seasons.find((played) => played.startYear === season.startYear)?.teamName }))
      .filter((season) => season.teamName !== undefined)
  }

  private defaultSeason(player: PlayerSearchResult, currentSeason: number | null): number {
    return player.seasons.some((played) => played.startYear === currentSeason) ? currentSeason! : player.seasons[0].startYear
  }

  private loadSelection(params: ParamMap): Observable<[PlayerSlot, PlayerSlot]> {
    const first = this.toSlotSelection(params, "p1", "s1")
    const second = this.toSlotSelection(params, "p2", "s2")
    this.firstPlayerId = first.playerId
    this.firstSeasons = this.firstSeasons.length ? this.firstSeasons : this.seasons
    this.secondSeasons = this.secondSeasons.length ? this.secondSeasons : this.seasons
    this.secondPlayerId = second.playerId
    this.firstSeason = first.season
    this.secondSeason = second.season
    return forkJoin([this.loadSlot(first), this.loadSlot(second)])
  }

  private toSlotSelection(params: ParamMap, playerKey: string, seasonKey: string): SlotSelection {
    return {
      playerId: Number(params.get(playerKey)) || null,
      season: Number(params.get(seasonKey)) || null,
    }
  }

  private loadSlot({ playerId, season }: SlotSelection): Observable<PlayerSlot> {
    if (playerId === null || season === null) {
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
