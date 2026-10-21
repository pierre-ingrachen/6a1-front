import { DecimalPipe } from "@angular/common"
import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core"
import { toObservable, toSignal } from "@angular/core/rxjs-interop"
import { FormsModule } from "@angular/forms"
import { MatIconModule } from "@angular/material/icon"
import { RouterLink } from "@angular/router"
import { of, switchMap } from "rxjs"
import { Player } from "models/player.model"
import { Season } from "models/season.model"
import { Team } from "models/team.model"
import { TeamService } from "services/team.service"
import { idleState, loadingState, toLoadState } from "utils/load-state"
import { defaultSortDirection, PLAYER_SORT_OPTIONS, PlayerSortKey, SortDirection, sortPlayers } from "utils/player-sort"
import { ratingLevel } from "utils/rating"

@Component({
  selector: "team-list",
  standalone: true,
  imports: [FormsModule, RouterLink, MatIconModule, DecimalPipe],
  templateUrl: "./team-list.component.html",
  styleUrls: ["./team-list.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamListComponent {
  private readonly teamService = inject(TeamService)

  readonly ratingLevel = ratingLevel
  readonly sortOptions = PLAYER_SORT_OPTIONS
  readonly sortKey = signal<PlayerSortKey>("averageRating")
  readonly sortDirection = signal<SortDirection>("desc")
  readonly teamSearch = signal("")
  readonly showTeamOptions = signal(false)
  readonly selectedTeamId = signal<number | null>(null)

  private readonly seasonChoice = signal<number | null | undefined>(undefined)
  private readonly teamsState = toSignal(toLoadState(this.teamService.findAllTeams(), [] as Team[]), {
    initialValue: loadingState([] as Team[]),
  })
  private readonly seasonsState = toSignal(
    toObservable(this.selectedTeamId).pipe(
      switchMap((teamId) =>
        teamId === null ? of(idleState([] as Season[])) : toLoadState(this.teamService.findSeasonsByTeam(teamId), [] as Season[]),
      ),
    ),
    { initialValue: idleState([] as Season[]) },
  )

  readonly teams = computed(() => this.teamsState().data)
  readonly seasons = computed(() => this.seasonsState().data)
  readonly selectedSeason = computed(() => {
    const choice = this.seasonChoice()
    return choice !== undefined ? choice : (this.seasons()[0]?.startYear ?? null)
  })

  private readonly playersState = toSignal(
    toObservable(computed(() => ({ teamId: this.selectedTeamId(), season: this.selectedSeason() }))).pipe(
      switchMap(({ teamId, season }) =>
        teamId === null || season === null
          ? of(idleState([] as Player[]))
          : toLoadState(this.teamService.findPlayersByTeam(teamId, season), [] as Player[]),
      ),
    ),
    { initialValue: idleState([] as Player[]) },
  )

  readonly players = computed(() => this.playersState().data)
  readonly sortedPlayers = computed(() => sortPlayers(this.players(), this.sortKey(), this.sortDirection()))
  readonly isLoadingTeams = computed(() => this.teamsState().status === "loading")
  readonly isLoadingSeasons = computed(() => this.seasonsState().status === "loading")
  readonly isLoadingPlayers = computed(() => this.playersState().status === "loading")
  readonly errorMessage = computed(() => {
    if (this.teamsState().status === "error") {
      return "Impossible de charger les équipes."
    }
    if (this.seasonsState().status === "error") {
      return "Impossible de charger les saisons de cette équipe."
    }
    if (this.playersState().status === "error") {
      return "Impossible de charger les joueurs pour cette sélection."
    }
    return null
  })
  readonly filteredTeams = computed(() => {
    const query = this.teamSearch().trim().toLocaleLowerCase()
    return query
      ? this.teams().filter((team) => `${team.name} ${team.country}`.toLocaleLowerCase().includes(query))
      : this.teams()
  })

  selectTeam(teamId: number | null): void {
    this.selectedTeamId.set(teamId)
    this.teamSearch.set(this.labelOf(teamId))
    this.showTeamOptions.set(false)
    this.seasonChoice.set(undefined)
  }

  searchTeams(query: string): void {
    this.teamSearch.set(query)
    this.showTeamOptions.set(true)

    const selectedLabel = this.labelOf(this.selectedTeamId())
    if (selectedLabel && query !== selectedLabel) {
      this.selectTeam(null)
      this.teamSearch.set(query)
      this.showTeamOptions.set(true)
    }
  }

  openTeamSearch(): void {
    const selectedLabel = this.labelOf(this.selectedTeamId())
    if (selectedLabel && this.teamSearch() === selectedLabel) {
      this.teamSearch.set("")
    }
    this.showTeamOptions.set(true)
  }

  closeTeamSearch(): void {
    this.showTeamOptions.set(false)
    const selectedLabel = this.labelOf(this.selectedTeamId())
    if (selectedLabel && !this.teamSearch().trim()) {
      this.teamSearch.set(selectedLabel)
    }
  }

  selectSeason(season: number | null): void {
    this.seasonChoice.set(season)
  }

  selectSortKey(key: PlayerSortKey): void {
    this.sortKey.set(key)
    this.sortDirection.set(defaultSortDirection(key))
  }

  private labelOf(teamId: number | null): string {
    const team = this.teams().find((item) => item.id === teamId)
    return team ? `${team.name} · ${team.country}` : ""
  }
}
