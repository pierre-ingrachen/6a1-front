import { ChangeDetectionStrategy, Component } from "@angular/core"

@Component({
  selector: "app-pitch-lines",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./pitch-lines.component.html",
  styleUrl: "./pitch-lines.component.scss",
})
export class PitchLinesComponent {}
