import { Component } from "@angular/core"
import { Location } from "@angular/common"
import { ActivatedRoute, Router } from "@angular/router"
import { catchError, combineLatest, map, Observable, of, shareReplay, switchMap } from "rxjs"
import { PlayerStat, PlayerStats } from "models/player-stats.model"
import { Season } from "models/season.model"
import { PlayerService } from "services/player.service"
import { SeasonService } from "services/season.service"
import { ratingLevel } from "utils/rating"

export type StatMode = "total" | "per90"

@Component({
  selector: "player-profile",
  templateUrl: "./player-profile.component.html",
  styleUrls: ["./player-profile.component.scss"],
})
export class PlayerProfileComponent {
  readonly ratingLevel = ratingLevel
  readonly positionLabels: Partial<Record<string, string>> = {
    Forward: "Attaquant",
    Midfielder: "Milieu",
    Defender: "Défenseur",
    Goalkeeper: "Gardien",
  }

  mode: StatMode = "total"
  playerId = Number(this.route.snapshot.paramMap.get("playerId"))
  seasons$: Observable<Season[]> = this.seasonService.findAllSeasons().pipe(shareReplay(1))
  season$: Observable<number | null> = combineLatest([this.route.queryParamMap, this.seasons$]).pipe(
    map(([params, [latestSeason]]) => Number(params.get("season")) || latestSeason?.startYear || null),
  )
  player$: Observable<PlayerStats | "missing"> = this.season$.pipe(
    switchMap((season) =>
      season === null
        ? of("missing" as const)
        : this.playerService.findPlayerStats(this.playerId, season).pipe(catchError(() => of("missing" as const))),
    ),
  )

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private playerService: PlayerService,
    private seasonService: SeasonService,
  ) {}

  back() {
    this.location.back()
  }

  selectSeason(season: number) {
    this.router.navigate([], { relativeTo: this.route, queryParams: { season }, replaceUrl: true })
  }

  hasValues(stats: PlayerStat[]): boolean {
    return stats.some((stat) => stat.total.value !== null)
  }
}
