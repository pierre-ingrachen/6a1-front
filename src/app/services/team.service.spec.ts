import { TestBed } from "@angular/core/testing"
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing"
import { TeamService } from "services/team.service"
import { Team } from "models/team.model"
import { Season } from "models/season.model"
import { Player } from "models/player.model"

describe("TeamService", () => {
  let teamService: TeamService
  let httpTestingController: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] })
    teamService = TestBed.inject(TeamService)
    httpTestingController = TestBed.inject(HttpTestingController)
  })

  afterEach(() => httpTestingController.verify())

  it("fetches all teams with GET /teams", () => {
    const teams: Team[] = [{ id: 13, name: "Arsenal", country: "England" }]

    teamService.findAllTeams().subscribe((receivedTeams) => expect(receivedTeams).toEqual(teams))

    const request = httpTestingController.expectOne("http://localhost:8080/teams")
    expect(request.request.method).toBe("GET")
    request.flush(teams)
  })

  it("fetches one team with GET /teams/{teamId}", () => {
    const team: Team = { id: 13, name: "Arsenal", country: "England" }

    teamService.findTeamById(13).subscribe((receivedTeam) => expect(receivedTeam).toEqual(team))

    const request = httpTestingController.expectOne("http://localhost:8080/teams/13")
    expect(request.request.method).toBe("GET")
    request.flush(team)
  })

  it("fetches the seasons of a team with GET /teams/{teamId}/seasons", () => {
    const seasons: Season[] = [{ startYear: 2025, label: "2025/2026" }]

    teamService.findSeasonsByTeam(13).subscribe((receivedSeasons) => expect(receivedSeasons).toEqual(seasons))

    const request = httpTestingController.expectOne("http://localhost:8080/teams/13/seasons")
    expect(request.request.method).toBe("GET")
    request.flush(seasons)
  })

  it("fetches the players of a team for a season with GET /teams/{teamId}/players?season=", () => {
    const players: Player[] = [{ id: 1, name: "Bukayo Saka", position: "Forward", heightCm: 178, weightKg: null }]

    teamService.findPlayersByTeam(13, 2024).subscribe((receivedPlayers) => expect(receivedPlayers).toEqual(players))

    const request = httpTestingController.expectOne("http://localhost:8080/teams/13/players?season=2024")
    expect(request.request.method).toBe("GET")
    request.flush(players)
  })
})
