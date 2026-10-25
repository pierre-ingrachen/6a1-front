import { TestBed } from "@angular/core/testing"
import { provideRouter } from "@angular/router"
import { NavbarComponent } from "navbar/navbar.component"

describe("NavbarComponent", () => {
  it("links to the player search page", () => {
    TestBed.configureTestingModule({ imports: [NavbarComponent], providers: [provideRouter([])] })
    const fixture = TestBed.createComponent(NavbarComponent)
    fixture.detectChanges()

    const hrefs = Array.from(fixture.nativeElement.querySelectorAll("a")).map((link) => (link as HTMLAnchorElement).getAttribute("href"))
    expect(hrefs).toContain("/joueurs")
  })
})
