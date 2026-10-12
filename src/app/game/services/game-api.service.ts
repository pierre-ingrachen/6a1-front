import { HttpClient } from "@angular/common/http"
import { Injectable, inject } from "@angular/core"
import { Observable } from "rxjs"
import { environment } from "../../../environments/environment"
import { CompetitionResult } from "game/models/competition.model"
import { Formation, Game, MoveCommand, PickCommand, RedrawType } from "game/models/game.model"

@Injectable({ providedIn: "root" })
export class GameApiService {
  private readonly http = inject(HttpClient)
  private readonly baseUrl = environment.apiUrl

  findFormations(): Observable<Formation[]> {
    return this.http.get<Formation[]>(`${this.baseUrl}/formations`)
  }

  createGame(formation: string): Observable<Game> {
    return this.http.post<Game>(`${this.baseUrl}/games`, { formation })
  }

  pickPlayer(gameId: string, command: PickCommand): Observable<Game> {
    return this.http.post<Game>(`${this.baseUrl}/games/${gameId}/picks`, command)
  }

  movePlayer(gameId: string, command: MoveCommand): Observable<Game> {
    return this.http.post<Game>(`${this.baseUrl}/games/${gameId}/moves`, command)
  }

  redraw(gameId: string, type: RedrawType): Observable<Game> {
    return this.http.post<Game>(`${this.baseUrl}/games/${gameId}/redraws`, { type })
  }

  simulateCompetition(gameId: string): Observable<CompetitionResult> {
    return this.http.post<CompetitionResult>(`${this.baseUrl}/games/${gameId}/simulation`, {})
  }
}
