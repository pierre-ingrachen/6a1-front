import { DecimalPipe, NgTemplateOutlet } from "@angular/common"
import { ChangeDetectionStrategy, Component, Input } from "@angular/core"
import { StatValue } from "models/player-stats.model"

@Component({
  selector: "stat-row",
  standalone: true,
  imports: [NgTemplateOutlet, DecimalPipe],
  templateUrl: "./stat-row.component.html",
  styleUrls: ["./stat-row.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatRowComponent {
  @Input() label = ""
  @Input() first: StatValue | null = null
  @Input() second: StatValue | null = null
  @Input() lowerIsBetter = false

  get best(): "first" | "second" | null {
    const firstValue = this.first?.value ?? null
    const secondValue = this.second?.value ?? null
    if (firstValue === null || secondValue === null || firstValue === secondValue) {
      return null
    }
    const firstIsBetter = this.lowerIsBetter ? firstValue < secondValue : firstValue > secondValue
    return firstIsBetter ? "first" : "second"
  }
}
