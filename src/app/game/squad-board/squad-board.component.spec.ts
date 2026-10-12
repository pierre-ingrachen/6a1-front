import { TestBed } from "@angular/core/testing"
import { Slot } from "game/models/game.model"
import { SquadBoardComponent } from "game/squad-board/squad-board.component"

const slots: Slot[] = [
  { index: 0, position: "GK", line: "GOALKEEPER", player: null },
  {
    index: 1,
    position: "ST",
    line: "ATTACKER",
    player: { playerId: 9, name: "Lionel Messi", rating: 95, teamName: "Barcelona", seasonLabel: "2012/2013", positions: ["ST"] },
  },
  { index: 2, position: "LW", line: "ATTACKER", player: null },
]

describe("SquadBoardComponent", () => {
  const create = (highlightedSlots: number[] = []) => {
    const fixture = TestBed.createComponent(SquadBoardComponent)
    fixture.componentRef.setInput("slots", slots)
    fixture.componentRef.setInput("highlightedSlots", highlightedSlots)
    fixture.detectChanges()
    return fixture.nativeElement as HTMLElement
  }

  beforeEach(() => TestBed.configureTestingModule({ imports: [SquadBoardComponent] }))

  it("renders one tile per slot", () => {
    expect(create().querySelectorAll(".slot").length).toBe(3)
  })

  it("shows the picked player with its rating", () => {
    const filled = create().querySelector(".slot.filled") as HTMLElement

    expect(filled.textContent).toContain("Lionel Messi")
    expect(filled.textContent).toContain("95")
  })

  it("highlights only empty eligible slots", () => {
    const highlighted = create([1, 2]).querySelectorAll(".slot.highlighted")

    expect(highlighted.length).toBe(1)
    expect(highlighted[0].textContent).toContain("AG")
  })

  it("emits the clicked slot index", () => {
    const fixture = TestBed.createComponent(SquadBoardComponent)
    fixture.componentRef.setInput("slots", slots)
    fixture.detectChanges()
    const clicked: number[] = []
    fixture.componentInstance.slotClicked.subscribe((index) => clicked.push(index))

    ;(fixture.nativeElement.querySelector(".slot.filled") as HTMLButtonElement).click()

    expect(clicked).toEqual([1])
  })

  it("places each token at the point defined by the formation", () => {
    const fixture = TestBed.createComponent(SquadBoardComponent)
    fixture.componentRef.setInput("slots", slots)
    fixture.componentRef.setInput("formation", "4-3-3")
    fixture.detectChanges()
    const goalkeeper = fixture.nativeElement.querySelector(".slot") as HTMLElement

    expect(goalkeeper.style.left).toBe("50%")
    expect(goalkeeper.style.top).toBe("91%")
  })

  it("shows a question mark on empty slots", () => {
    const empty = create().querySelector(".slot:not(.filled) .token") as HTMLElement

    expect(empty.textContent?.trim()).toBe("?")
  })

  it("marks the selected slot and its move targets", () => {
    const fixture = TestBed.createComponent(SquadBoardComponent)
    fixture.componentRef.setInput("slots", slots)
    fixture.componentRef.setInput("selectedSlot", 1)
    fixture.componentRef.setInput("moveTargets", [2])
    fixture.detectChanges()
    const element = fixture.nativeElement as HTMLElement

    expect(element.querySelectorAll(".slot.selected").length).toBe(1)
    expect(element.querySelectorAll(".slot.target").length).toBe(1)
  })
})
