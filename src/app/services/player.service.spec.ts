import { TestBed } from "@angular/core/testing"
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing"
import { PlayerService } from "services/player.service"
import { SeasonService } from "services/season.service"
import { PlayerSearchResult } from "models/player-search-result.model"
import { Season } from "models/season.model"

describe("PlayerService and SeasonService", () => {
  let playerService: PlayerService
  let seasonService: SeasonService
  let httpTestingController: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] })
    playerService = TestBed.inject(PlayerService)
    seasonService = TestBed.inject(SeasonService)
    httpTestingController = TestBed.inject(HttpTestingController)
  })

  afterEach(() => httpTestingController.verify())

  it("fetches all seasons with GET /seasons", () => {
    const seasons: Season[] = [{ startYear: 2025, label: "2025/2026" }]

    seasonService.findAllSeasons().subscribe((receivedSeasons) => expect(receivedSeasons).toEqual(seasons))

    const request = httpTestingController.expectOne("http://localhost:8080/seasons")
    expect(request.request.method).toBe("GET")
    request.flush(seasons)
  })

  it("searches players with GET /players/search?query=", () => {
    const results: PlayerSearchResult[] = [{ id: 300713, name: "Kylian Mbappé", position: "Forward", teamName: "Real Madrid", seasons: [{ startYear: 2025, teamName: "Real Madrid" }] }]

    playerService.searchPlayers("mba").subscribe((receivedResults) => expect(receivedResults).toEqual(results))

    const request = httpTestingController.expectOne("http://localhost:8080/players/search?query=mba")
    expect(request.request.method).toBe("GET")
    request.flush(results)
  })

  it("fetches player stats with GET /players/{playerId}/stats?season=", () => {
    playerService.findPlayerStats(300713, 2025).subscribe((stats) => expect(stats.name).toBe("Kylian Mbappé"))

    const request = httpTestingController.expectOne("http://localhost:8080/players/300713/stats?season=2025")
    expect(request.request.method).toBe("GET")
    request.flush({ name: "Kylian Mbappé" })
  })
})
