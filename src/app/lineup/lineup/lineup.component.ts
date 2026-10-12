import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"
import { JerseyComponent } from "../jersey/jersey.component"
import { PitchLinesComponent } from "../pitch-lines/pitch-lines.component"
import { FORMATIONS, FormationId, Slot } from "../models/formation.model"
import { Player } from "../models/player.model"

interface PlacedPlayer {
  player: Player
  slot: Slot
  goalkeeper: boolean
}

@Component({
  selector: "app-lineup",
  standalone: true,
  imports: [JerseyComponent, PitchLinesComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./lineup.component.html",
  styleUrl: "./lineup.component.scss",
})
export class LineupComponent {
  readonly players = input.required<Player[]>()
  readonly formation = input<FormationId>("reference")
  readonly teamColor = input("#1b2e5c")
  readonly numberColor = input("#e8453c")

  protected readonly placedPlayers = computed<PlacedPlayer[]>(() => {
    const slots = FORMATIONS[this.formation()]
    return this.players()
      .slice(0, slots.length)
      .map((player, index) => ({ player, slot: slots[index], goalkeeper: index === 0 }))
  })

  protected readonly ariaLabel = computed(() => {
    const names = this.placedPlayers().map(({ player }) => `${player.number} ${player.name}`)
    return `Composition d'équipe en ${this.formation()} : ${names.join(", ")}`
  })
}
