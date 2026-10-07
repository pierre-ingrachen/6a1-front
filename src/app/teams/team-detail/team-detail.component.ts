import { Component, OnInit } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { catchError, EMPTY, Observable } from "rxjs"
import { Team } from "models/team.model"
import { Season } from "models/season.model"
import { Player } from "models/player.model"
import { defaultSortDirection, PLAYER_SORT_OPTIONS, PlayerSortKey, SortDirection, sortPlayers } from "utils/player-sort"
import { ratingLevel } from "utils/rating"
import { TeamService } from "services/team.service"

@Component({
  selector: "team-detail",
  templateUrl: "./team-detail.component.html",
  styleUrls: ["./team-detail.component.scss"],
})
export class TeamDetailComponent implements OnInit {
  readonly ratingLevel = ratingLevel
  readonly sortOptions = PLAYER_SORT_OPTIONS
  sortKey: PlayerSortKey = "name"
  sortDirection: SortDirection = "asc"
  teamId = Number(this.route.snapshot.paramMap.get("teamId"))
  team$: Observable<Team> = this.teamService.findTeamById(this.teamId).pipe(catchError(() => EMPTY))
  seasons: Season[] = []
  selectedSeason: number | null = null
  players$: Observable<Player[]> = EMPTY
  teamNotFound = false

  constructor(
    private route: ActivatedRoute,
    private teamService: TeamService,
  ) {}

  ngOnInit() {
    this.teamService.findSeasonsByTeam(this.teamId).subscribe({
      next: (seasons) => {
        this.seasons = seasons
        const [latestSeason] = seasons
        if (latestSeason) {
          this.selectSeason(latestSeason.startYear)
        }
      },
      error: () => (this.teamNotFound = true),
    })
  }

  selectSeason(season: number) {
    this.selectedSeason = season
    this.players$ = this.teamService.findPlayersByTeam(this.teamId, season)
  }

  selectSortKey(key: PlayerSortKey): void {
    this.sortKey = key
    this.sortDirection = defaultSortDirection(key)
  }

  sorted(players: Player[]): Player[] {
    return sortPlayers(players, this.sortKey, this.sortDirection)
  }
}
