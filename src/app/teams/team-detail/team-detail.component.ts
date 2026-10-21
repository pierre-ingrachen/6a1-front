import { DecimalPipe } from "@angular/common"
import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core"
import { toObservable, toSignal } from "@angular/core/rxjs-interop"
import { FormsModule } from "@angular/forms"
import { MatButtonModule } from "@angular/material/button"
import { ActivatedRoute, RouterLink } from "@angular/router"
import { of, switchMap } from "rxjs"
import { Player } from "models/player.model"
import { Season } from "models/season.model"
import { Team } from "models/team.model"
import { TeamService } from "services/team.service"
import { idleState, loadingState, toLoadState } from "utils/load-state"
import { defaultSortDirection, PLAYER_SORT_OPTIONS, PlayerSortKey, SortDirection, sortPlayers } from "utils/player-sort"
import { ratingLevel } from "utils/rating"

@Component({
  selector: "team-detail",
  standalone: true,
  imports: [FormsModule, RouterLink, MatButtonModule, DecimalPipe],
  templateUrl: "./team-detail.component.html",
  styleUrls: ["./team-detail.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamDetailComponent {
  private readonly route = inject(ActivatedRoute)
  private readonly teamService = inject(TeamService)

  readonly ratingLevel = ratingLevel
  readonly sortOptions = PLAYER_SORT_OPTIONS
  readonly sortKey = signal<PlayerSortKey>("averageRating")
  readonly sortDirection = signal<SortDirection>("desc")
  readonly teamId = Number(this.route.snapshot.paramMap.get("teamId"))

  private readonly seasonChoice = signal<number | null>(null)
  private readonly teamState = toSignal(toLoadState<Team | null>(this.teamService.findTeamById(this.teamId), null), {
    initialValue: loadingState<Team | null>(null),
  })
  private readonly seasonsState = toSignal(toLoadState(this.teamService.findSeasonsByTeam(this.teamId), [] as Season[]), {
    initialValue: loadingState([] as Season[]),
  })

  readonly team = computed(() => this.teamState().data)
  readonly seasons = computed(() => this.seasonsState().data)
  readonly selectedSeason = computed(() => this.seasonChoice() ?? this.seasons()[0]?.startYear ?? null)
  readonly teamNotFound = computed(() => this.teamState().status === "error" || this.seasonsState().status === "error")

  private readonly playersState = toSignal(
    toObservable(this.selectedSeason).pipe(
      switchMap((season) =>
        season === null
          ? of(idleState([] as Player[]))
          : toLoadState(this.teamService.findPlayersByTeam(this.teamId, season), [] as Player[]),
      ),
    ),
    { initialValue: idleState([] as Player[]) },
  )

  readonly players = computed(() => this.playersState().data)
  readonly sortedPlayers = computed(() => sortPlayers(this.players(), this.sortKey(), this.sortDirection()))
  readonly isLoadingPlayers = computed(() => this.playersState().status === "loading")
  readonly playersLoaded = computed(() => this.playersState().status === "loaded")
  readonly playersFailed = computed(() => this.playersState().status === "error")

  selectSeason(season: number): void {
    this.seasonChoice.set(season)
  }

  selectSortKey(key: PlayerSortKey): void {
    this.sortKey.set(key)
    this.sortDirection.set(defaultSortDirection(key))
  }
}
