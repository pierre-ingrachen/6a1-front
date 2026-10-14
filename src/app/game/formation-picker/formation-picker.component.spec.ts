import { ComponentFixture, TestBed } from "@angular/core/testing"
import { FormationPickerComponent } from "game/formation-picker/formation-picker.component"
import { Formation } from "game/models/game.model"

describe("FormationPickerComponent", () => {
  let fixture: ComponentFixture<FormationPickerComponent>

  const formations: Formation[] = [
    { label: "4-1-2-1-2", positions: [] },
    { label: "5-1-2-2", positions: [] },
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

  it("shows the family title and the variant of a tactical variant", () => {
    const button = create().querySelectorAll(".formation")[1]

    expect(button.querySelector("strong")?.textContent?.trim()).toBe("5-3-2")
    expect(button.querySelector(".nickname")?.textContent?.trim()).toBe("Défensif")
  })

  it("shows a single word under a standalone formation", () => {
    const button = create().querySelectorAll(".formation")[0]

    expect(button.querySelector("strong")?.textContent?.trim()).toBe("4-1-2-1-2")
    expect(button.querySelector(".nickname")?.textContent?.trim()).toBe("Losange")
  })

  it("shows no word for an unknown formation", () => {
    const button = create().querySelectorAll(".formation")[2]

    expect(button.querySelector(".nickname")).toBeNull()
  })

  it("emits the label of the chosen formation", () => {
    const element = create()
    const emitted: string[] = []
    fixture.componentInstance.formationSelected.subscribe((label) => emitted.push(label))

    ;(element.querySelector(".formation") as HTMLButtonElement).click()

    expect(emitted).toEqual(["4-1-2-1-2"])
  })

  it("marks the selected formation as pressed", () => {
    create()
    fixture.componentRef.setInput("selected", "9-0-1")
    fixture.detectChanges()

    const pressed = Array.from(fixture.nativeElement.querySelectorAll(".formation")).map((button) =>
      (button as HTMLElement).getAttribute("aria-pressed"),
    )

    expect(pressed).toEqual(["false", "false", "true"])
  })

  it("disables every formation while a request is running", () => {
    const buttons = create(true).querySelectorAll("button")

    expect(Array.from(buttons).every((button) => button.disabled)).toBeTrue()
  })
})
