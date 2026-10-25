import { Injectable } from "@angular/core"
import { Observable, Subject } from "rxjs"

const CURRENT_GAME_KEY = "6a1.currentGameId"

@Injectable({ providedIn: "root" })
export class GameSessionService {
  private readonly newGameRequests = new Subject<void>()
  readonly newGameRequested$: Observable<void> = this.newGameRequests.asObservable()

  requestNewGame(): void {
    this.newGameRequests.next()
  }

  read(): string | null {
    try {
      return sessionStorage.getItem(CURRENT_GAME_KEY)
    } catch {
      return null
    }
  }

  save(gameId: string): void {
    try {
      sessionStorage.setItem(CURRENT_GAME_KEY, gameId)
    } catch {
      return
    }
  }

  clear(): void {
    try {
      sessionStorage.removeItem(CURRENT_GAME_KEY)
    } catch {
      return
    }
  }
}
