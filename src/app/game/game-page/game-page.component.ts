import { HttpErrorResponse } from "@angular/common/http"
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from "@angular/core"
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop"
import { Observable } from "rxjs"
import { CompetitionResultComponent } from "game/competition-result/competition-result.component"
import { FormationPickerComponent } from "game/formation-picker/formation-picker.component"
import { CompetitionResult } from "game/models/competition.model"
import { Game, PickCommand, RedrawType } from "game/models/game.model"
import { RedrawActionsComponent } from "game/redraw-actions/redraw-actions.component"
import { GameApiService } from "game/services/game-api.service"
import { moveTargetsOf } from "game/utils/move-targets"
import { SquadBoardComponent } from "game/squad-board/squad-board.component"
import { TeamDrawCardComponent } from "game/team-draw-card/team-draw-card.component"

@Component({
  selector: "game-page",
  standalone: true,
  imports: [
    FormationPickerComponent,
    SquadBoardComponent,
    TeamDrawCardComponent,
    RedrawActionsComponent,
    CompetitionResultComponent,
  ],
  templateUrl: "./game-page.component.html",
  styleUrls: ["./game-page.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GamePageComponent {
  private readonly api = inject(GameApiService)
  private readonly destroyRef = inject(DestroyRef)

  readonly formations = toSignal(this.api.findFormations(), { initialValue: [] })
  readonly game = signal<Game | null>(null)
  readonly result = signal<CompetitionResult | null>(null)
  readonly loading = signal(false)
  readonly errorMessage = signal<string | null>(null)

  readonly highlightedSlots = computed(() => this.game()?.draw?.players.flatMap((player) => player.eligibleSlots) ?? [])
  readonly selectedSlot = signal<number | null>(null)
  readonly moveTargets = computed(() => moveTargetsOf(this.game()?.slots ?? [], this.selectedSlot()))
  readonly readyToSimulate = computed(() => this.game()?.status === "READY_TO_SIMULATE")

  startGame(formation: string): void {
    this.run(this.api.createGame(formation), (game) => this.game.set(game))
  }

  pick(command: PickCommand): void {
    this.withGame((game) => this.run(this.api.pickPlayer(game.id, command), (updated) => this.game.set(updated)))
  }

  selectSlot(slotIndex: number): void {
    const slots = this.game()?.slots ?? []
    const clicked = slots.find((slot) => slot.index === slotIndex)
    const selected = this.selectedSlot()
    if (selected !== null && this.moveTargets().includes(slotIndex)) {
      this.movePlayer(selected, slotIndex)
    } else if (clicked?.player && slotIndex !== selected) {
      this.selectedSlot.set(slotIndex)
    } else {
      this.selectedSlot.set(null)
    }
  }

  redraw(type: RedrawType): void {
    this.withGame((game) => this.run(this.api.redraw(game.id, type), (updated) => this.game.set(updated)))
  }

  private movePlayer(fromSlot: number, toSlot: number): void {
    this.selectedSlot.set(null)
    this.withGame((game) =>
      this.run(this.api.movePlayer(game.id, { fromSlot, toSlot }), (updated) => this.game.set(updated)),
    )
  }

  simulate(): void {
    this.withGame((game) => this.run(this.api.simulateCompetition(game.id), (result) => this.result.set(result)))
  }

  restart(): void {
    this.game.set(null)
    this.selectedSlot.set(null)
    this.result.set(null)
    this.errorMessage.set(null)
  }

  private withGame(action: (game: Game) => void): void {
    const game = this.game()
    if (game) {
      action(game)
    }
  }

  private run<T>(request: Observable<T>, onSuccess: (value: T) => void): void {
    this.loading.set(true)
    this.errorMessage.set(null)
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (value) => {
        onSuccess(value)
        this.loading.set(false)
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(error.error?.message ?? "Le serveur ne répond pas.")
        this.loading.set(false)
      },
    })
  }
}
