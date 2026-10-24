import { ComponentFixture, TestBed } from "@angular/core/testing"
import { RedrawActionsComponent } from "game/redraw-actions/redraw-actions.component"
import { RedrawType } from "game/models/game.model"

describe("RedrawActionsComponent", () => {
  let fixture: ComponentFixture<RedrawActionsComponent>

  const create = (redrawsRemaining: number, disabled = false, seasonAvailable = true, teamAvailable = true) => {
    fixture = TestBed.createComponent(RedrawActionsComponent)
    fixture.componentRef.setInput("redrawsRemaining", redrawsRemaining)
    fixture.componentRef.setInput("disabled", disabled)
    fixture.componentRef.setInput("seasonAvailable", seasonAvailable)
    fixture.componentRef.setInput("teamAvailable", teamAvailable)
    fixture.detectChanges()
    return fixture.nativeElement as HTMLElement
  }

  beforeEach(() => TestBed.configureTestingModule({ imports: [RedrawActionsComponent] }))

  it("shows the remaining quota", () => {
    expect(create(2).querySelector(".quota strong")?.textContent?.trim()).toBe("2")
  })

  it("emits the requested redraw type", () => {
    const element = create(3)
    const emitted: RedrawType[] = []
    fixture.componentInstance.redrawRequested.subscribe((type) => emitted.push(type))

    ;(element.querySelector(".season") as HTMLButtonElement).click()
    ;(element.querySelector(".team") as HTMLButtonElement).click()

    expect(emitted).toEqual(["SEASON", "TEAM"])
  })

  it("disables both buttons when no redraw is left", () => {
    const buttons = create(0).querySelectorAll("button")

    expect(Array.from(buttons).every((button) => button.disabled)).toBeTrue()
  })

  it("disables both buttons while a request is running", () => {
    const buttons = create(3, true).querySelectorAll("button")

    expect(Array.from(buttons).every((button) => button.disabled)).toBeTrue()
  })

  it("disables only the season button, with an explanation, when no other season exists", () => {
    const element = create(3, false, false, true)
    const season = element.querySelector(".season") as HTMLButtonElement
    const team = element.querySelector(".team") as HTMLButtonElement

    expect(season.disabled).toBeTrue()
    expect(season.title).toBe("Aucune autre année disponible pour cette équipe")
    expect(team.disabled).toBeFalse()
    expect(team.title).toBe("")
  })

  it("disables only the team button, with an explanation, when no other team exists", () => {
    const element = create(3, false, true, false)
    const team = element.querySelector(".team") as HTMLButtonElement

    expect(team.disabled).toBeTrue()
    expect(team.title).toBe("Aucune autre équipe disponible pour cette année")
    expect((element.querySelector(".season") as HTMLButtonElement).disabled).toBeFalse()
  })
})
