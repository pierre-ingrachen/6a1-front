import { DecimalPipe, Location } from "@angular/common"
import { HttpErrorResponse } from "@angular/common/http"
import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core"
import { toObservable, toSignal } from "@angular/core/rxjs-interop"
import { FormsModule } from "@angular/forms"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { ActivatedRoute, Router, RouterLink } from "@angular/router"
import { catchError, forkJoin, map, Observable, of, switchMap, throwError } from "rxjs"
import { PlayerStat, PlayerStats } from "models/player-stats.model"
import { StatMode } from "models/stat-mode.model"
import { Season } from "models/season.model"
import { PlayerService } from "services/player.service"
import { SeasonService } from "services/season.service"
import { idleState, loadingState, toLoadState } from "utils/load-state"
import { playerPositionLabel } from "utils/position-label"
import { ratingLevel } from "utils/rating"

@Component({
  selector: "player-profile",
  standalone: true,
  imports: [FormsModule, RouterLink, MatButtonModule, MatIconModule, DecimalPipe],
  templateUrl: "./player-profile.component.html",
  styleUrls: ["./player-profile.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerProfileComponent {
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly location = inject(Location)
  private readonly playerService = inject(PlayerService)
  private readonly seasonService = inject(SeasonService)

  readonly ratingLevel = ratingLevel
  readonly positionLabel = playerPositionLabel

  readonly mode = signal<StatMode>("total")
  readonly playerId = Number(this.route.snapshot.paramMap.get("playerId"))

  private readonly seasonsState = toSignal(toLoadState(this.findPlayerSeasonOptions(), [] as Season[]), {
    initialValue: loadingState([] as Season[]),
  })
  private readonly queryParams = toSignal(this.route.queryParamMap, { requireSync: true })

  readonly seasons = computed(() => this.seasonsState().data)
  readonly seasonsFailed = computed(() => this.seasonsState().status === "error")
  readonly season = computed(() => {
    const requested = Number(this.queryParams().get("season"))
    const available = this.seasons()
    return available.find((season) => season.startYear === requested)?.startYear ?? available[0]?.startYear ?? null
  })

  private readonly playerState = toSignal(
    toObservable(computed(() => (this.seasonsState().status === "loaded" ? { season: this.season() } : null))).pipe(
      switchMap((request) => {
        if (request === null) {
          return of(idleState<PlayerStats | null>(null))
        }
        return request.season === null
          ? of({ status: "error" as const, data: null })
          : toLoadState<PlayerStats | null>(this.playerService.findPlayerStats(this.playerId, request.season), null)
      }),
    ),
    { initialValue: idleState<PlayerStats | null>(null) },
  )

  readonly player = computed(() => this.playerState().data)
  readonly playerMissing = computed(() => this.playerState().status === "error")

  private findPlayerSeasonOptions(): Observable<Season[]> {
    return forkJoin({
      seasons: this.seasonService.findAllSeasons(),
      playerSeasons: this.playerService
        .findPlayerSeasons(this.playerId)
        .pipe(
          catchError((error) =>
            error instanceof HttpErrorResponse && error.status === 404 ? of([]) : throwError(() => error),
          ),
        ),
    }).pipe(
      map(({ seasons, playerSeasons }) =>
        seasons.filter((season) => playerSeasons.some((playerSeason) => playerSeason.startYear === season.startYear)),
      ),
    )
  }

  back(): void {
    this.location.back()
  }

  selectSeason(season: number): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { season }, replaceUrl: true })
  }

  hasValues(stats: PlayerStat[]): boolean {
    return stats.some((stat) => stat.total.value !== null)
  }
}
