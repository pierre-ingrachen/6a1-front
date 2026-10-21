import { TestBed } from "@angular/core/testing"
import { GameSessionService } from "game/services/game-session.service"

describe("GameSessionService", () => {
  let service: GameSessionService

  beforeEach(() => {
    sessionStorage.clear()
    service = TestBed.inject(GameSessionService)
  })

  afterEach(() => sessionStorage.clear())

  it("remembers the current game id", () => {
    service.save("game-1")

    expect(service.read()).toBe("game-1")
  })

  it("forgets the game id", () => {
    service.save("game-1")

    service.clear()

    expect(service.read()).toBeNull()
  })

  it("returns null when the storage is unavailable", () => {
    spyOn(Storage.prototype, "getItem").and.throwError("denied")

    expect(service.read()).toBeNull()
  })

  it("does not throw when the storage refuses writes", () => {
    spyOn(Storage.prototype, "setItem").and.throwError("quota")
    spyOn(Storage.prototype, "removeItem").and.throwError("denied")

    expect(() => service.save("game-1")).not.toThrow()
    expect(() => service.clear()).not.toThrow()
  })
})
