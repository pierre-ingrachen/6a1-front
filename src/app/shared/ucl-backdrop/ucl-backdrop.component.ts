import { ChangeDetectionStrategy, Component, input } from "@angular/core"

@Component({
  selector: "app-ucl-backdrop",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./ucl-backdrop.component.html",
  styleUrl: "./ucl-backdrop.component.scss",
})
export class UclBackdropComponent {
  readonly stadium = input<string | null>(null)
  readonly decor = input(true)
}
