import { ComponentFixture, TestBed } from "@angular/core/testing"
import { provideRouter } from "@angular/router"
import { NotFoundComponent } from "not-found/not-found.component"

describe("NotFoundComponent", () => {
  let fixture: ComponentFixture<NotFoundComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [NotFoundComponent], providers: [provideRouter([])] })
    fixture = TestBed.createComponent(NotFoundComponent)
    fixture.detectChanges()
  })

  it("tells the visitor the page does not exist", () => {
    expect(fixture.nativeElement.querySelector("h1").textContent).toContain("Page introuvable")
  })

  it("links back to the home page", () => {
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector("a")

    expect(link.getAttribute("href")).toBe("/")
  })
})
