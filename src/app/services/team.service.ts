import { Injectable, inject } from "@angular/core"
import { HttpClient, HttpParams } from "@angular/common/http"
import { Observable } from "rxjs"
import { Team } from "models/team.model"
import { Season } from "models/season.model"
import { Player } from "models/player.model"
import { ApiUrlService } from "services/api-url.service"

@Injectable({
  providedIn: "root",
})
export class TeamService {
  private readonly http = inject(HttpClient)
  private readonly teamUrl = inject(ApiUrlService).resolve("teams")

  findAllTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(this.teamUrl)
  }

  findTeamById(teamId: number): Observable<Team> {
    return this.http.get<Team>(`${this.teamUrl}/${teamId}`)
  }

  findSeasonsByTeam(teamId: number): Observable<Season[]> {
    return this.http.get<Season[]>(`${this.teamUrl}/${teamId}/seasons`)
  }

  findPlayersByTeam(teamId: number, season: number): Observable<Player[]> {
    const params = new HttpParams().set("season", season)
    return this.http.get<Player[]>(`${this.teamUrl}/${teamId}/players`, { params })
  }
}
