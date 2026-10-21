import { TestBed } from "@angular/core/testing"
import { ApiUrlService } from "services/api-url.service"
import { environment } from "../../environments/environment"

describe("ApiUrlService", () => {
  const service = () => TestBed.inject(ApiUrlService)

  it("prefixes paths with the configured API url", () => {
    expect(service().resolve("players/search")).toBe(`${environment.apiUrl}/players/search`)
  })

  it("does not duplicate slashes", () => {
    expect(service().resolve("/teams")).toBe(`${environment.apiUrl}/teams`)
  })
})
