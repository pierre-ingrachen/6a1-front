import { ChangeDetectionStrategy, Component, input } from "@angular/core"
import { GroupStanding } from "game/models/competition.model"

@Component({
  selector: "group-table",
  standalone: true,
  templateUrl: "./group-table.component.html",
  styleUrls: ["./group-table.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupTableComponent {
  readonly standings = input.required<GroupStanding[]>()
}
