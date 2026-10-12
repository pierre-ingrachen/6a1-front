import { ComponentFixture, TestBed } from "@angular/core/testing"
import { FormationPickerComponent } from "game/formation-picker/formation-picker.component"
import { Formation } from "game/models/game.model"

describe("FormationPickerComponent", () => {
  let fixture: ComponentFixture<FormationPickerComponent>

  const formations: Formation[] = [
    { label: "4-1-2-1-2", positions: [] },
    { label: "9-0-1", positions: [] },
  ]

  const create = (disabled = false) => {
    fixture = TestBed.createComponent(FormationPickerComponent)
    fixture.componentRef.setInput("formations", formations)
    fixture.componentRef.setInput("disabled", disabled)
    fixture.detectChanges()
    return fixture.nativeElement as HTMLElement
  }

  beforeEach(() => TestBed.configureTestingModule({ imports: [FormationPickerComponent] }))

  it("shows the nickname of known formations only", () => {
    const buttons = create().querySelectorAll(".formation")

    expect(buttons[0].querySelector("small")?.textContent?.trim()).toBe("Losange")
    expect(buttons[1].querySelector("small")).toBeNull()
  })

  it("emits the label of the chosen formation", () => {
    const element = create()
    const emitted: string[] = []
    fixture.componentInstance.formationSelected.subscribe((label) => emitted.push(label))

    ;(element.querySelector(".formation") as HTMLButtonElement).click()

    expect(emitted).toEqual(["4-1-2-1-2"])
  })

  it("disables every formation while a request is running", () => {
    const buttons = create(true).querySelectorAll("button")

    expect(Array.from(buttons).every((button) => button.disabled)).toBeTrue()
  })
})
