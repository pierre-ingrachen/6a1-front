import { Injectable } from "@angular/core"
import { HttpClient, HttpParams } from "@angular/common/http"
import { Observable } from "rxjs"
import { PlayerSearchResult } from "models/player-search-result.model"
import { PlayerStats } from "models/player-stats.model"

@Injectable({
  providedIn: "root",
})
export class PlayerService {
  private playerUrl = "http://localhost:8080/players"

  constructor(private http: HttpClient) {}

  searchPlayers(season: number, query: string): Observable<PlayerSearchResult[]> {
    const params = new HttpParams().set("season", season).set("query", query)
    return this.http.get<PlayerSearchResult[]>(`${this.playerUrl}/search`, { params })
  }

  findPlayerStats(playerId: number, season: number): Observable<PlayerStats> {
    const params = new HttpParams().set("season", season)
    return this.http.get<PlayerStats>(`${this.playerUrl}/${playerId}/stats`, { params })
  }
}
