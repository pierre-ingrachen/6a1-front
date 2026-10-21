import { HttpClient } from "@angular/common/http"
import { Injectable, inject } from "@angular/core"
import { Observable } from "rxjs"
import { ApiUrlService } from "services/api-url.service"
import { CompetitionResult } from "game/models/competition.model"
import { Formation, Game, MoveCommand, PickCommand, RedrawType } from "game/models/game.model"

@Injectable({ providedIn: "root" })
export class GameApiService {
  private readonly http = inject(HttpClient)
  private readonly apiUrl = inject(ApiUrlService)

  findFormations(): Observable<Formation[]> {
    return this.http.get<Formation[]>(this.apiUrl.resolve("formations"))
  }

  findGame(gameId: string): Observable<Game> {
    return this.http.get<Game>(this.apiUrl.resolve(`games/${gameId}`))
  }

  createGame(formation: string): Observable<Game> {
    return this.http.post<Game>(this.apiUrl.resolve("games"), { formation })
  }

  pickPlayer(gameId: string, command: PickCommand): Observable<Game> {
    return this.http.post<Game>(this.apiUrl.resolve(`games/${gameId}/picks`), command)
  }

  movePlayer(gameId: string, command: MoveCommand): Observable<Game> {
    return this.http.post<Game>(this.apiUrl.resolve(`games/${gameId}/moves`), command)
  }

  redraw(gameId: string, type: RedrawType): Observable<Game> {
    return this.http.post<Game>(this.apiUrl.resolve(`games/${gameId}/redraws`), { type })
  }

  simulateCompetition(gameId: string): Observable<CompetitionResult> {
    return this.http.post<CompetitionResult>(this.apiUrl.resolve(`games/${gameId}/simulation`), {})
  }
}
