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

describe("TeamDrawCardComponent", () => {
  it("lists goalkeepers first and attackers last, regardless of rating", () => {
    const fixture = TestBed.createComponent(TeamDrawCardComponent)
    fixture.componentRef.setInput("draw", draw)
    fixture.componentRef.setInput("slots", [])
    fixture.detectChanges()

    const names = Array.from(fixture.nativeElement.querySelectorAll(".identity strong"), (element: Element) =>
      element.textContent?.trim(),
    )

    expect(names).toEqual(["Keeper", "Defender", "Midfielder", "Striker"])
  })
})
