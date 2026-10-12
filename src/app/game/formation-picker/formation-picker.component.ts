import { ChangeDetectionStrategy, Component, EventEmitter, Output, input } from "@angular/core"
import { Formation } from "game/models/game.model"

@Component({
  selector: "formation-picker",
  standalone: true,
  templateUrl: "./formation-picker.component.html",
  styleUrls: ["./formation-picker.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormationPickerComponent {
  readonly formations = input.required<Formation[]>()
  readonly disabled = input(false)
  @Output() readonly formationSelected = new EventEmitter<string>()
}
