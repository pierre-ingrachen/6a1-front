import { Injectable, inject } from "@angular/core"
import { HttpClient, HttpParams } from "@angular/common/http"
import { Observable } from "rxjs"
import { PlayerSearchResult } from "models/player-search-result.model"
import { PlayerStats } from "models/player-stats.model"
import { ApiUrlService } from "services/api-url.service"

@Injectable({
  providedIn: "root",
})
export class PlayerService {
  private readonly http = inject(HttpClient)
  private readonly playerUrl = inject(ApiUrlService).resolve("players")

  searchPlayers(query: string): Observable<PlayerSearchResult[]> {
    const params = new HttpParams().set("query", query)
    return this.http.get<PlayerSearchResult[]>(`${this.playerUrl}/search`, { params })
  }

  findPlayerStats(playerId: number, season: number): Observable<PlayerStats> {
    const params = new HttpParams().set("season", season)
    return this.http.get<PlayerStats>(`${this.playerUrl}/${playerId}/stats`, { params })
  }
}
