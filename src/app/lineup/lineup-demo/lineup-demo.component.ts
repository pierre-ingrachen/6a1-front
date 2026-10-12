import { ChangeDetectionStrategy, Component, signal } from "@angular/core"
import { LineupComponent } from "../lineup/lineup.component"
import { FORMATION_IDS, FormationId } from "../models/formation.model"
import { Player } from "../models/player.model"

const REFERENCE_PLAYERS: Player[] = [
  { number: 1, name: "Donnarumma" },
  { number: 25, name: "N.Mendes" },
  { number: 51, name: "Pacho" },
  { number: 5, name: "Marquinhos", captain: true },
  { number: 2, name: "Hakimi" },
  { number: 8, name: "Fabian" },
  { number: 17, name: "Vitinha" },
  { number: 87, name: "João Neves" },
  { number: 7, name: "Kvaratskhelia" },
  { number: 10, name: "O.Dembélé" },
  { number: 14, name: "D.Doué" },
]

@Component({
  selector: "app-lineup-demo",
  standalone: true,
  imports: [LineupComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./lineup-demo.component.html",
  styleUrl: "./lineup-demo.component.scss",
})
export class LineupDemoComponent {
  protected readonly formationIds = FORMATION_IDS
  protected readonly formation = signal<FormationId>("reference")
  protected readonly players = signal<Player[]>(REFERENCE_PLAYERS)

  protected selectFormation(event: Event): void {
    this.formation.set((event.target as HTMLSelectElement).value as FormationId)
  }

  protected updateName(index: number, event: Event): void {
    this.patchPlayer(index, { name: (event.target as HTMLInputElement).value })
  }

  protected updateNumber(index: number, event: Event): void {
    this.patchPlayer(index, { number: Number((event.target as HTMLInputElement).value) })
  }

  protected updateCaptain(index: number, event: Event): void {
    this.patchPlayer(index, { captain: (event.target as HTMLInputElement).checked })
  }

  private patchPlayer(index: number, patch: Partial<Player>): void {
    this.players.update((players) => players.map((player, i) => (i === index ? { ...player, ...patch } : player)))
  }
}
