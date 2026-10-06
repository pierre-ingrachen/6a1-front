import { Component } from "@angular/core"
import { Observable } from "rxjs"
import { Team } from "models/team.model"
import { TeamService } from "services/team.service"

@Component({
  selector: "team-list",
  templateUrl: "./team-list.component.html",
  styleUrls: ["./team-list.component.scss"],
})
export class TeamListComponent {
  teams$: Observable<Team[]> = this.teamService.findAllTeams()

  constructor(private teamService: TeamService) {}
}
