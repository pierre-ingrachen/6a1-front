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

  it("shows the picked player with the jersey number of its position", () => {
    const filled = create().querySelector(".slot.filled") as HTMLElement

    expect(filled.textContent).toContain("L.Messi")
    expect(filled.textContent).toContain("9")
  })

  it("shows a blank jersey without number on empty slots", () => {
    const empty = create().querySelector(".slot:not(.filled)") as HTMLElement

    expect(empty.querySelector("text")?.textContent?.trim()).toBe("")
  })

  it("colors the jersey red with a white number only when the slot is filled", () => {
    const root = create()
    const filled = root.querySelector(".slot.filled") as HTMLElement
    const empty = Array.from(root.querySelectorAll<HTMLElement>(".slot:not(.filled)")).find((slot) => slot.textContent?.includes("AG"))!

    expect(filled.querySelector(".body")?.getAttribute("fill")).toBe("#d62828")
    expect(filled.querySelector("text")?.getAttribute("fill")).toBe("#ffffff")
    expect(empty.querySelector(".body")?.getAttribute("fill")).toBe("#ffffff")
  })

  it("shows a white goalkeeper jersey while its slot is empty", () => {
    const goalkeeper = Array.from(create().querySelectorAll<HTMLElement>(".slot:not(.filled)")).find((slot) =>
      slot.title.length > 0 && !slot.textContent?.includes("AG"),
    )!

    expect(goalkeeper.querySelector(".body")?.getAttribute("fill")).toBe("#ffffff")
  })

  it("keeps the goalkeeper jersey green when its slot is filled", () => {
    const fixture = TestBed.createComponent(SquadBoardComponent)
    const filledGoalkeeper: Slot = { ...slots[0], player: slots[1].player }
    fixture.componentRef.setInput("slots", [filledGoalkeeper])
    fixture.detectChanges()

    const body = fixture.nativeElement.querySelector(".slot.filled .body") as SVGElement

    expect(body.getAttribute("fill")).toBe("#3aa84a")
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

  it("enables only compatible draw targets while selecting a drawn player", () => {
    const fixture = TestBed.createComponent(SquadBoardComponent)
    fixture.componentRef.setInput("slots", slots)
    fixture.componentRef.setInput("drawTargets", [2])
    fixture.componentRef.setInput("selectingDrawPlayer", true)
    fixture.detectChanges()
    const element = fixture.nativeElement as HTMLElement

    expect((element.querySelector(".slot.draw-target") as HTMLButtonElement).disabled).toBeFalse()
    expect((element.querySelector(".slot.filled") as HTMLButtonElement).disabled).toBeTrue()
    expect((element.querySelector(".slot:not(.draw-target):not(.filled)") as HTMLButtonElement).disabled).toBeTrue()
  })
})
