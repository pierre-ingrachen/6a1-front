import { ComponentFixture, TestBed } from "@angular/core/testing"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { MatAutocompleteModule } from "@angular/material/autocomplete"
import { NoopAnimationsModule } from "@angular/platform-browser/animations"
import { of } from "rxjs"
import { PlayerPickerComponent } from "compare/player-picker/player-picker.component"
import { PlayerSearchComponent } from "compare/player-search/player-search.component"
import { PlayerService } from "services/player.service"

describe("PlayerPickerComponent", () => {
  let fixture: ComponentFixture<PlayerPickerComponent>

  const seasonSelect = (): HTMLSelectElement => fixture.nativeElement.querySelector("select")

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlayerPickerComponent, PlayerSearchComponent],
      imports: [FormsModule, ReactiveFormsModule, MatAutocompleteModule, NoopAnimationsModule],
      providers: [{ provide: PlayerService, useValue: { searchPlayers: () => of([]) } }],
    })
    fixture = TestBed.createComponent(PlayerPickerComponent)
    fixture.componentRef.setInput("inputId", "player")
    fixture.componentRef.setInput("label", "Joueur 1")
    fixture.componentRef.setInput("seasons", [
      { startYear: 2025, label: "2025/2026" },
      { startYear: 2024, label: "2024/2025" },
    ])
  })

  it("disables the season until a player is chosen", async () => {
    fixture.detectChanges()
    await fixture.whenStable()

    expect(seasonSelect().disabled).toBeTrue()
  })

  it("emits the chosen season once a player is chosen", async () => {
    fixture.componentRef.setInput("hasPlayer", true)
    fixture.componentRef.setInput("selectedSeason", 2025)
    const emitted: number[] = []
    fixture.componentInstance.seasonSelected.subscribe((season) => emitted.push(season))
    fixture.detectChanges()
    await fixture.whenStable()

    seasonSelect().value = seasonSelect().options[2].value
    seasonSelect().dispatchEvent(new Event("change"))

    expect(seasonSelect().disabled).toBeFalse()
    expect(emitted).toEqual([2024])
  })
})
