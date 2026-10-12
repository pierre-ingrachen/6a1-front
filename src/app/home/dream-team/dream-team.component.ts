import { ChangeDetectionStrategy, Component } from "@angular/core"
import { LineupComponent } from "lineup/lineup/lineup.component"
import { Player } from "lineup/models/player.model"
import { assignJerseyNumbers } from "lineup/utils/jersey-numbers"
import { DREAM_TEAM } from "home/dream-team/dream-team.data"

const NUMBERS = assignJerseyNumbers(DREAM_TEAM.map(({ position }) => position))

@Component({
  selector: "dream-team",
  standalone: true,
  imports: [LineupComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./dream-team.component.html",
  styleUrl: "./dream-team.component.scss",
})
export class DreamTeamComponent {
  protected readonly lineup: Player[] = DREAM_TEAM.map(({ name, captain }, index) => ({
    number: NUMBERS[index],
    name: name.split(" ").pop() ?? name,
    captain,
  }))
}
