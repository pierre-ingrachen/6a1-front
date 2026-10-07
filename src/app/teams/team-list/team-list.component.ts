import { Component, DestroyRef, OnInit } from "@angular/core"
import { takeUntilDestroyed } from "@angular/core/rxjs-interop"
import { BehaviorSubject, combineLatest, of, Subject } from "rxjs"
import { catchError, startWith, switchMap, tap } from "rxjs/operators"
import { Player } from "models/player.model"
import { defaultSortDirection, PLAYER_SORT_OPTIONS, PlayerSortKey, SortDirection, sortPlayers } from "utils/player-sort"
import { ratingLevel } from "utils/rating"
import { Season } from "models/season.model"
import { Team } from "models/team.model"
import { TeamService } from "services/team.service"

@Component({
  selector: "team-list",
  templateUrl: "./team-list.component.html",
  styleUrls: ["./team-list.component.scss"],
})
export class TeamListComponent implements OnInit {
  readonly ratingLevel = ratingLevel
  readonly sortOptions = PLAYER_SORT_OPTIONS
  sortKey: PlayerSortKey = "averageRating"
  sortDirection: SortDirection = "desc"
  teams: Team[] = []
  seasons: Season[] = []
  players: Player[] = []
  selectedTeamId: number | null = null
  selectedSeason: number | null = null
  teamSearch = ""
  showTeamOptions = false
  isLoadingTeams = true
  isLoadingSeasons = false
  isLoadingPlayers = false
  errorMessage: string | null = null

  private readonly teamSelection$ = new Subject<number | null>()
  private readonly seasonSelection$ = new BehaviorSubject<number | null>(null)

  get filteredTeams(): Team[] {
    const query = this.teamSearch.trim().toLocaleLowerCase()
    if (!query) {
      return this.teams
    }

    return this.teams.filter((team) =>
      `${team.name} ${team.country}`.toLocaleLowerCase().includes(query),
    )
  }

  constructor(
    private teamService: TeamService,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.teamSelection$
      .pipe(
        switchMap((teamId) => {
          if (teamId === null) {
            return of([])
          }

          this.isLoadingSeasons = true
          return this.teamService.findSeasonsByTeam(teamId).pipe(
            catchError(() => {
              this.errorMessage = "Impossible de charger les saisons de cette équipe."
              return of([])
            }),
          )
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((seasons) => {
        this.seasons = seasons
        this.isLoadingSeasons = false
        if (seasons.length > 0) {
          this.selectSeason(seasons[0].startYear)
        } else {
          this.selectedSeason = null
          this.players = []
          this.seasonSelection$.next(null)
        }
      })

    combineLatest([
      this.teamSelection$.pipe(startWith(null)),
      this.seasonSelection$,
    ])
      .pipe(
        switchMap(([teamId, season]) => {
          if (teamId === null || season === null) {
            this.isLoadingPlayers = false
            return of([])
          }

          this.isLoadingPlayers = true
          return this.teamService.findPlayersByTeam(teamId, season).pipe(
            catchError(() => {
              this.errorMessage = "Impossible de charger les joueurs pour cette sélection."
              return of([])
            }),
          )
        }),
        tap(() => (this.isLoadingPlayers = false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((players) => (this.players = players))

    this.teamService
      .findAllTeams()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (teams) => {
          this.teams = teams
          this.isLoadingTeams = false
        },
        error: () => {
          this.errorMessage = "Impossible de charger les équipes."
          this.isLoadingTeams = false
        },
      })
  }

  selectTeam(teamId: number | null): void {
    this.selectedTeamId = teamId
    const team = this.teams.find((item) => item.id === teamId)
    this.teamSearch = team ? `${team.name} · ${team.country}` : ""
    this.showTeamOptions = false
    this.selectedSeason = null
    this.seasons = []
    this.players = []
    this.errorMessage = null
    this.seasonSelection$.next(null)
    this.teamSelection$.next(teamId)
  }

  searchTeams(query: string): void {
    this.teamSearch = query
    this.showTeamOptions = true

    const selectedTeam = this.teams.find((team) => team.id === this.selectedTeamId)
    if (selectedTeam && query !== `${selectedTeam.name} · ${selectedTeam.country}`) {
      this.selectTeam(null)
      this.teamSearch = query
      this.showTeamOptions = true
    }
  }

  openTeamSearch(): void {
    const selectedTeam = this.teams.find((team) => team.id === this.selectedTeamId)
    if (selectedTeam && this.teamSearch === `${selectedTeam.name} · ${selectedTeam.country}`) {
      this.teamSearch = ""
    }
    this.showTeamOptions = true
  }

  closeTeamSearch(): void {
    this.showTeamOptions = false
    const selectedTeam = this.teams.find((team) => team.id === this.selectedTeamId)
    if (selectedTeam && !this.teamSearch.trim()) {
      this.teamSearch = `${selectedTeam.name} · ${selectedTeam.country}`
    }
  }

  selectSeason(season: number | null): void {
    this.selectedSeason = season
    this.players = []
    this.errorMessage = null
    this.seasonSelection$.next(season)
  }

  selectSortKey(key: PlayerSortKey): void {
    this.sortKey = key
    this.sortDirection = defaultSortDirection(key)
  }

  sorted(players: Player[]): Player[] {
    return sortPlayers(players, this.sortKey, this.sortDirection)
  }
}
