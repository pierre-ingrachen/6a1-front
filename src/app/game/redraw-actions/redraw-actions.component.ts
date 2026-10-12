import { ChangeDetectionStrategy, Component, EventEmitter, Output, computed, input } from "@angular/core"
import { RedrawType } from "game/models/game.model"

@Component({
  selector: "redraw-actions",
  standalone: true,
  templateUrl: "./redraw-actions.component.html",
  styleUrls: ["./redraw-actions.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RedrawActionsComponent {
  readonly redrawsRemaining = input.required<number>()
  readonly disabled = input(false)
  @Output() readonly redrawRequested = new EventEmitter<RedrawType>()

  readonly exhausted = computed(() => this.redrawsRemaining() <= 0)
}
