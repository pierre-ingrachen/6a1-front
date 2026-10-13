import { ChangeDetectionStrategy, Component, EventEmitter, Output, input } from "@angular/core"
import { Formation } from "game/models/game.model"
import { formationName } from "game/utils/position-labels"

@Component({
  selector: "formation-picker",
  standalone: true,
  templateUrl: "./formation-picker.component.html",
  styleUrls: ["./formation-picker.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormationPickerComponent {
  readonly formations = input.required<Formation[]>()
  readonly selected = input<string | null>(null)
  readonly disabled = input(false)
  @Output() readonly formationSelected = new EventEmitter<string>()

  readonly name = formationName
}
