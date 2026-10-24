import { DecimalPipe, Location } from "@angular/common"
import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core"
import { toObservable, toSignal } from "@angular/core/rxjs-interop"
import { FormsModule } from "@angular/forms"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { ActivatedRoute, Router, RouterLink } from "@angular/router"
import { of, switchMap } from "rxjs"
import { PlayerStat, PlayerStats } from "models/player-stats.model"
import { Season } from "models/season.model"
import { PlayerService } from "services/player.service"
import { SeasonService } from "services/season.service"
import { idleState, loadingState, toLoadState } from "utils/load-state"
import { playerPositionLabel } from "utils/position-label"
import { ratingLevel } from "utils/rating"

export type StatMode = "total" | "per90"

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

  private readonly seasonsState = toSignal(toLoadState(this.seasonService.findAllSeasons(), [] as Season[]), {
    initialValue: loadingState([] as Season[]),
  })
  private readonly queryParams = toSignal(this.route.queryParamMap, { requireSync: true })

  readonly seasons = computed(() => this.seasonsState().data)
  readonly seasonsFailed = computed(() => this.seasonsState().status === "error")
  readonly season = computed(
    () => Number(this.queryParams().get("season")) || this.seasons()[0]?.startYear || null,
  )

  private readonly playerState = toSignal(
    toObservable(
      computed(() => (this.seasonsState().status === "loaded" ? { season: this.season() } : null)),
    ).pipe(
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
