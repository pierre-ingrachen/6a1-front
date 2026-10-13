import { TestBed } from "@angular/core/testing"
import { Draw } from "game/models/game.model"
import { TeamDrawCardComponent } from "game/team-draw-card/team-draw-card.component"

const draw: Draw = {
  teamId: 1,
  teamName: "Barcelona",
  country: "Spain",
  seasonLabel: "2012/2013",
  players: [
    { playerId: 1, name: "Keeper", rating: 95, line: "GOALKEEPER", positions: ["GK"], eligibleSlots: [3], alreadyPicked: false },
    { playerId: 2, name: "Defender", rating: 90, line: "DEFENDER", positions: ["CB"], eligibleSlots: [2], alreadyPicked: false },
    { playerId: 3, name: "Midfielder", rating: 85, line: "MIDFIELDER", positions: ["CM"], eligibleSlots: [1], alreadyPicked: false },
    { playerId: 4, name: "Striker", rating: 80, line: "ATTACKER", positions: ["ST"], eligibleSlots: [0], alreadyPicked: false },
  ],
}

const namesOf = (fixture: { nativeElement: HTMLElement }) =>
  Array.from(fixture.nativeElement.querySelectorAll(".name"), (element) => element.textContent?.trim())

describe("TeamDrawCardComponent", () => {
  it("sorts players of the same line by surname, ignoring accents and rating", () => {
    const fixture = TestBed.createComponent(TeamDrawCardComponent)
    const midfielder = (playerId: number, name: string, rating: number) => ({
      playerId, name, rating, line: "MIDFIELDER" as const, positions: ["CM"], eligibleSlots: [1], alreadyPicked: false,
    })
    fixture.componentRef.setInput("draw", {
      ...draw,
      players: [midfielder(1, "Xavi Hernández", 99), midfielder(2, "Álvaro Zidane", 50), midfielder(3, "Sergio Busquets", 70)],
    })
    fixture.componentRef.setInput("slots", [])
    fixture.detectChanges()

    expect(namesOf(fixture)).toEqual(["Busquets", "Hernández", "Zidane"])
  })

  it("lists goalkeepers first and attackers last, regardless of rating", () => {
    const fixture = TestBed.createComponent(TeamDrawCardComponent)
    fixture.componentRef.setInput("draw", draw)
    fixture.componentRef.setInput("slots", [])
    fixture.detectChanges()

    const names = Array.from(fixture.nativeElement.querySelectorAll(".name"), (element: Element) =>
      element.textContent?.trim(),
    )

    expect(names).toEqual(["Keeper", "Defender", "Midfielder", "Striker"])
  })
})
