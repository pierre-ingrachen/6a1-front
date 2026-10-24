import { ComponentFixture, fakeAsync, TestBed, tick } from "@angular/core/testing"
import { PlayerSortBarComponent } from "teams/player-sort-bar/player-sort-bar.component"

describe("PlayerSortBarComponent", () => {
  let fixture: ComponentFixture<PlayerSortBarComponent>
  let keyChange: jasmine.Spy
  let directionChange: jasmine.Spy

  const selects = (): HTMLSelectElement[] => Array.from(fixture.nativeElement.querySelectorAll("select"))
  const choose = (select: HTMLSelectElement, index: number) => {
    select.selectedIndex = index
    select.dispatchEvent(new Event("change"))
    fixture.detectChanges()
    tick()
  }

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({ imports: [PlayerSortBarComponent] })
    fixture = TestBed.createComponent(PlayerSortBarComponent)
    keyChange = jasmine.createSpy("sortKeyChange")
    directionChange = jasmine.createSpy("directionChange")
    fixture.componentInstance.sortKeyChange.subscribe(keyChange)
    fixture.componentInstance.directionChange.subscribe(directionChange)
    fixture.detectChanges()
    tick()
  }))

  it("lists every sort option and both directions", () => {
    expect(Array.from(selects()[0].options).map((o) => o.textContent?.trim())).toEqual([
      "Nom", "Matchs joués", "Buts", "Passes décisives", "Rating", "Note moyenne",
    ])
    expect(Array.from(selects()[1].options).map((o) => o.textContent?.trim())).toEqual(["Croissant", "Décroissant"])
  })

  it("selects the current key and direction", fakeAsync(() => {
    fixture.detectChanges()
    tick()

    expect(selects()[0].selectedOptions[0].textContent?.trim()).toBe("Note moyenne")
    expect(selects()[1].selectedOptions[0].textContent?.trim()).toBe("Décroissant")
  }))

  it("reflects the sortKey and direction inputs and emits changes from the selects", fakeAsync(() => {
    fixture.componentRef.setInput("sortKey", "goals")
    fixture.componentRef.setInput("direction", "asc")
    fixture.detectChanges()
    tick()

    expect(selects()[0].selectedOptions[0].textContent?.trim()).toBe("Buts")
    expect(selects()[1].selectedOptions[0].textContent?.trim()).toBe("Croissant")

    choose(selects()[1], 1)
    expect(directionChange).toHaveBeenCalledOnceWith("desc")
    choose(selects()[0], 3)
    expect(keyChange).toHaveBeenCalledOnceWith("assists")
  }))

  it("resets the direction to the key default when the key changes", fakeAsync(() => {
    choose(selects()[0], 0)

    expect(keyChange).toHaveBeenCalledOnceWith("name")
    expect(directionChange).toHaveBeenCalledOnceWith("asc")
  }))

  it("changes the direction without touching the key", fakeAsync(() => {
    choose(selects()[1], 0)

    expect(keyChange).not.toHaveBeenCalled()
    expect(directionChange).toHaveBeenCalledOnceWith("asc")
  }))
})
