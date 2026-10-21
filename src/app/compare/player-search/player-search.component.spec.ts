import { ComponentFixture, fakeAsync, TestBed, tick } from "@angular/core/testing"
import { ReactiveFormsModule } from "@angular/forms"
import { MatAutocompleteModule } from "@angular/material/autocomplete"
import { NoopAnimationsModule } from "@angular/platform-browser/animations"
import { of, throwError } from "rxjs"
import { PlayerSearchComponent } from "compare/player-search/player-search.component"
import { PlayerService } from "services/player.service"

describe("PlayerSearchComponent", () => {
  let playerService: jasmine.SpyObj<PlayerService>
  let fixture: ComponentFixture<PlayerSearchComponent>

  const type = (text: string) => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input")
    input.value = text
    input.dispatchEvent(new Event("input"))
  }

  beforeEach(() => {
    playerService = jasmine.createSpyObj<PlayerService>("PlayerService", ["searchPlayers"])
    playerService.searchPlayers.and.returnValue(
      of([{ id: 300713, name: "Kylian Mbappé", position: "Forward", teamName: "Real Madrid", seasons: [{ startYear: 2025, teamName: "Real Madrid" }] }]),
    )
    TestBed.configureTestingModule({
      imports: [PlayerSearchComponent, NoopAnimationsModule],
      providers: [{ provide: PlayerService, useValue: playerService }],
    })
    fixture = TestBed.createComponent(PlayerSearchComponent)
    fixture.componentRef.setInput("inputId", "first-player")
    fixture.componentRef.setInput("label", "Joueur 1")
    fixture.detectChanges()
  })

  it("searches players of the season once the user stops typing at least two characters", fakeAsync(() => {
    type("m")
    tick(300)
    expect(playerService.searchPlayers).not.toHaveBeenCalled()

    type("mb")
    tick(100)
    type("mba")
    tick(300)

    expect(playerService.searchPlayers).toHaveBeenCalledOnceWith("mba")
  }))

  it("shows an error and keeps searching after a failed request", fakeAsync(() => {
    playerService.searchPlayers.and.returnValues(
      throwError(() => new Error("500")),
      of([{ id: 300713, name: "Kylian Mbappé", position: "Forward", teamName: "Real Madrid", seasons: [{ startYear: 2025, teamName: "Real Madrid" }] }]),
    )

    type("mba")
    tick(300)
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector(".search-error")?.textContent).toContain("La recherche a échoué")

    type("mbap")
    tick(300)
    fixture.detectChanges()

    expect(playerService.searchPlayers).toHaveBeenCalledTimes(2)
    expect(playerService.searchPlayers).toHaveBeenCalledWith("mbap")
    expect(fixture.componentInstance.results().map((player) => player.name)).toEqual(["Kylian Mbappé"])
    expect(fixture.nativeElement.querySelector(".search-error")).toBeNull()
  }))

  it("shows the selected player name in the input", async () => {
    fixture.componentRef.setInput("selectedName", "Kylian Mbappé")
    fixture.detectChanges()
    await fixture.whenStable()

    expect(fixture.nativeElement.querySelector("input").value).toBe("Kylian Mbappé")
  })
})
