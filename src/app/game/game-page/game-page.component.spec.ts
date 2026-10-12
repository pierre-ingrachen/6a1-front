import { HttpErrorResponse } from "@angular/common/http"
import { TestBed } from "@angular/core/testing"
import { of, throwError } from "rxjs"
import { GamePageComponent } from "game/game-page/game-page.component"
import { CompetitionResult } from "game/models/competition.model"
import { Game } from "game/models/game.model"
import { GameApiService } from "game/services/game-api.service"

const draftingGame: Game = {
  id: "game-1",
  formation: "4-3-3",
  status: "DRAFTING",
  picksRemaining: 11,
  redrawsRemaining: 3,
  squadAverageRating: null,
  slots: [{ index: 0, position: "GK", line: "GOALKEEPER", player: null }],
  draw: {
    teamId: 1,
    teamName: "Barcelona",
    country: "Spain",
    seasonLabel: "2012/2013",
    players: [
      {
        playerId: 5,
        name: "Victor Valdes",
        rating: 80,
        line: "GOALKEEPER",
        positions: ["GK"],
        eligibleSlots: [0],
        alreadyPicked: false,
      },
    ],
  },
}

const movableGame: Game = {
  ...draftingGame,
  slots: [
    {
      index: 0,
      position: "CM",
      line: "MIDFIELDER",
      player: { playerId: 1, name: "A", rating: 80, teamName: "T", seasonLabel: "2020/2021", positions: ["CM", "RB"] },
    },
    { index: 1, position: "RB", line: "MIDFIELDER", player: null },
  ],
}

const result: CompetitionResult = {
  squadStrength: { attack: 80, defense: 78 },
  groupStage: { matches: [], standings: [], rank: 1 },
  knockoutMatches: [],
  outcome: "WINNER",
  champion: true,
}

describe("GamePageComponent", () => {
  let api: jasmine.SpyObj<GameApiService>

  const create = () => {
    const fixture = TestBed.createComponent(GamePageComponent)
    fixture.detectChanges()
    return fixture
  }

  beforeEach(() => {
    api = jasmine.createSpyObj<GameApiService>("GameApiService", [
      "findFormations",
      "createGame",
      "pickPlayer",
      "redraw",
      "movePlayer",
      "simulateCompetition",
    ])
    api.findFormations.and.returnValue(of([{ label: "4-3-3", positions: ["GK"] }]))
    TestBed.configureTestingModule({ imports: [GamePageComponent], providers: [{ provide: GameApiService, useValue: api }] })
  })

  it("offers the formations before the game starts", () => {
    const fixture = create()

    expect(fixture.nativeElement.querySelectorAll(".formation").length).toBe(1)
  })

  it("starts a game with the chosen formation and shows the draw", () => {
    api.createGame.and.returnValue(of(draftingGame))
    const fixture = create()

    fixture.componentInstance.startGame("4-3-3")
    fixture.detectChanges()

    expect(api.createGame).toHaveBeenCalledWith("4-3-3")
    expect(fixture.nativeElement.textContent).toContain("Barcelona")
    expect(fixture.nativeElement.textContent).toContain("Victor Valdes")
  })

  it("sends the pick for the current game", () => {
    api.createGame.and.returnValue(of(draftingGame))
    api.pickPlayer.and.returnValue(of({ ...draftingGame, picksRemaining: 10 }))
    const fixture = create()
    fixture.componentInstance.startGame("4-3-3")

    fixture.componentInstance.pick({ playerId: 5, slotIndex: 0 })

    expect(api.pickPlayer).toHaveBeenCalledWith("game-1", { playerId: 5, slotIndex: 0 })
    expect(fixture.componentInstance.game()?.picksRemaining).toBe(10)
  })

  it("moves a player by selecting him then a target slot", () => {
    api.createGame.and.returnValue(of(movableGame))
    api.movePlayer.and.returnValue(of(movableGame))
    const fixture = create()
    fixture.componentInstance.startGame("4-3-3")

    fixture.componentInstance.selectSlot(0)
    expect(fixture.componentInstance.moveTargets()).toEqual([1])
    fixture.componentInstance.selectSlot(1)

    expect(api.movePlayer).toHaveBeenCalledWith("game-1", { fromSlot: 0, toSlot: 1 })
    expect(fixture.componentInstance.selectedSlot()).toBeNull()
  })

  it("deselects when clicking the selected slot again", () => {
    api.createGame.and.returnValue(of(movableGame))
    const fixture = create()
    fixture.componentInstance.startGame("4-3-3")

    fixture.componentInstance.selectSlot(0)
    fixture.componentInstance.selectSlot(0)

    expect(fixture.componentInstance.selectedSlot()).toBeNull()
  })

  it("proposes to launch the competition once the draft is complete", () => {
    api.createGame.and.returnValue(of({ ...draftingGame, status: "READY_TO_SIMULATE", draw: null, picksRemaining: 0 }))
    const fixture = create()

    fixture.componentInstance.startGame("4-3-3")
    fixture.detectChanges()

    expect(fixture.nativeElement.querySelector(".ready button")).not.toBeNull()
  })

  it("shows the competition result after the simulation", () => {
    api.createGame.and.returnValue(of({ ...draftingGame, status: "READY_TO_SIMULATE", draw: null }))
    api.simulateCompetition.and.returnValue(of(result))
    const fixture = create()
    fixture.componentInstance.startGame("4-3-3")

    fixture.componentInstance.simulate()
    fixture.detectChanges()

    expect(fixture.nativeElement.textContent).toContain("Champion d'Europe")
  })

  it("displays the server error message", () => {
    api.createGame.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 409, error: { message: "No redraw left" } })),
    )
    const fixture = create()

    fixture.componentInstance.startGame("4-3-3")
    fixture.detectChanges()

    expect(fixture.nativeElement.querySelector(".error")?.textContent).toContain("No redraw left")
    expect(fixture.componentInstance.loading()).toBeFalse()
  })

  it("goes back to the formation menu on restart", () => {
    api.createGame.and.returnValue(of(draftingGame))
    const fixture = create()
    fixture.componentInstance.startGame("4-3-3")

    fixture.componentInstance.restart()
    fixture.detectChanges()

    expect(fixture.componentInstance.game()).toBeNull()
    expect(fixture.nativeElement.querySelectorAll(".formation").length).toBe(1)
  })
})
