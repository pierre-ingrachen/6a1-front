import { HttpErrorResponse } from "@angular/common/http"
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from "@angular/core"
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop"
import { Observable, timer } from "rxjs"
import { CompetitionResultComponent } from "game/competition-result/competition-result.component"
import { CompetitionSimulationComponent } from "game/competition-simulation/competition-simulation.component"
import { FormationPickerComponent } from "game/formation-picker/formation-picker.component"
import { CompetitionResult } from "game/models/competition.model"
import { DrawPlayer, Formation, Game, PickCommand, RedrawType } from "game/models/game.model"
import { RedrawActionsComponent } from "game/redraw-actions/redraw-actions.component"
import { GameApiService } from "game/services/game-api.service"
import { moveTargetsOf } from "game/utils/move-targets"
import { previewSlotsOf } from "game/utils/preview-slots"
import { SquadBoardComponent } from "game/squad-board/squad-board.component"
import { TeamDrawCardComponent } from "game/team-draw-card/team-draw-card.component"

const DEFAULT_FORMATION = "4-3-3"

@Component({
  selector: "game-page",
  standalone: true,
  imports: [
    FormationPickerComponent,
    SquadBoardComponent,
    TeamDrawCardComponent,
    RedrawActionsComponent,
    CompetitionResultComponent,
    CompetitionSimulationComponent,
  ],
  templateUrl: "./game-page.component.html",
  styleUrls: ["./game-page.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GamePageComponent {
  private readonly api = inject(GameApiService)
  private readonly destroyRef = inject(DestroyRef)

  readonly formations = toSignal(this.api.findFormations(), { initialValue: [] })
  readonly previewedLabel = signal<string | null>(null)
  readonly previewedFormation = computed<Formation | null>(
    () =>
      this.formations().find((formation) => formation.label === this.previewedLabel()) ??
      this.formations().find((formation) => formation.label === DEFAULT_FORMATION) ??
      this.formations()[0] ??
      null,
  )
  readonly previewSlots = computed(() => previewSlotsOf(this.previewedFormation()?.positions ?? []))
  readonly game = signal<Game | null>(null)
  readonly result = signal<CompetitionResult | null>(null)
  readonly simulationFinished = signal(false)
  readonly loading = signal(false)
  readonly errorMessage = signal<string | null>(null)
  readonly drawRevealed = signal(false)
  readonly drawLoading = signal(false)
  readonly selectedDrawPlayer = signal<DrawPlayer | null>(null)

  readonly drawTargets = computed(() => {
    const player = this.selectedDrawPlayer()
    const slots = this.game()?.slots ?? []
    return player
      ? player.eligibleSlots.filter((index) => slots.some((slot) => slot.index === index && !slot.player))
      : []
  })
  readonly highlightedSlots = computed(() =>
    this.selectedDrawPlayer()
      ? this.drawTargets()
      : this.drawRevealed()
        ? (this.game()?.draw?.players.flatMap((player) => player.eligibleSlots) ?? [])
        : [],
  )
  readonly selectedSlot = signal<number | null>(null)
  readonly moveTargets = computed(() => moveTargetsOf(this.game()?.slots ?? [], this.selectedSlot()))
  readonly readyToSimulate = computed(() => this.game()?.status === "READY_TO_SIMULATE")

  previewFormation(label: string): void {
    this.previewedLabel.set(label)
  }

  confirmFormation(): void {
    const formation = this.previewedFormation()
    if (formation) {
      this.startGame(formation.label)
    }
  }

  startGame(formation: string): void {
    this.run(this.api.createGame(formation), (game) => {
      this.game.set(game)
      this.drawRevealed.set(false)
      this.drawLoading.set(false)
      this.selectedDrawPlayer.set(null)
    })
  }

  revealDraw(): void {
    if (this.drawLoading() || this.drawRevealed()) {
      return
    }

    this.loadDraw()
  }

  private loadDraw(): void {
    this.drawRevealed.set(false)
    this.drawLoading.set(true)
    timer(700)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.drawLoading.set(false)
        this.drawRevealed.set(true)
      })
  }

  pick(command: PickCommand): void {
    this.withGame((game) =>
      this.run(this.api.pickPlayer(game.id, command), (updated) => {
        this.game.set(updated)
        this.selectedDrawPlayer.set(null)
        if (updated.draw) {
          this.loadDraw()
        } else {
          this.drawRevealed.set(false)
          this.drawLoading.set(false)
        }
      }),
    )
  }

  selectDrawPlayer(player: DrawPlayer): void {
    if (this.loading() || player.alreadyPicked) {
      return
    }

    this.selectedSlot.set(null)
    this.selectedDrawPlayer.update((selected) => (selected?.playerId === player.playerId ? null : player))
  }

  selectSlot(slotIndex: number): void {
    const drawPlayer = this.selectedDrawPlayer()
    if (drawPlayer) {
      if (this.drawTargets().includes(slotIndex)) {
        this.pick({ playerId: drawPlayer.playerId, slotIndex })
      }
      return
    }

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
    this.withGame((game) =>
      this.run(this.api.redraw(game.id, type), (updated) => {
        this.game.set(updated)
        this.selectedDrawPlayer.set(null)
        if (updated.draw) {
          this.loadDraw()
        } else {
          this.drawRevealed.set(false)
          this.drawLoading.set(false)
        }
      }),
    )
  }

  private movePlayer(fromSlot: number, toSlot: number): void {
    this.selectedSlot.set(null)
    this.withGame((game) =>
      this.run(this.api.movePlayer(game.id, { fromSlot, toSlot }), (updated) => this.game.set(updated)),
    )
  }

  simulate(): void {
    this.withGame((game) =>
      this.run(this.api.simulateCompetition(game.id), (result) => {
        this.simulationFinished.set(false)
        this.result.set(result)
      }),
    )
  }

  restart(): void {
    this.game.set(null)
    this.drawRevealed.set(false)
    this.drawLoading.set(false)
    this.selectedDrawPlayer.set(null)
    this.selectedSlot.set(null)
    this.result.set(null)
    this.simulationFinished.set(false)
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
