import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"
import { PenaltyKick } from "game/models/simulation.model"

@Component({
  selector: "shootout-panel",
  standalone: true,
  templateUrl: "./shootout-panel.component.html",
  styleUrls: ["./shootout-panel.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShootoutPanelComponent {
  readonly kicks = input.required<PenaltyKick[]>()
  readonly revealed = input.required<number>()
  readonly opponentName = input.required<string>()

  readonly takenKicks = computed(() => this.kicks().slice(0, this.revealed()))
  readonly ourKicks = computed(() => this.takenKicks().filter((kick) => kick.side === "FOR"))
  readonly theirKicks = computed(() => this.takenKicks().filter((kick) => kick.side === "AGAINST"))
  readonly scoreFor = computed(() => this.ourKicks().filter((kick) => kick.scored).length)
  readonly scoreAgainst = computed(() => this.theirKicks().filter((kick) => kick.scored).length)
  readonly nextKick = computed(() => this.kicks()[this.revealed()] ?? null)
  readonly nextTaker = computed(() => {
    const kick = this.nextKick()
    return kick ? (kick.takerName ?? (kick.side === "FOR" ? "Ton équipe" : this.opponentName())) : null
  })
}
