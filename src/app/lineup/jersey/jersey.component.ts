import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"

let nextJerseyId = 0

@Component({
  selector: "app-jersey",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./jersey.component.html",
  styleUrl: "./jersey.component.scss",
})
export class JerseyComponent {
  readonly number = input.required<number | string>()
  readonly color = input("#ffffff")
  readonly numberColor = input("#1b2e5c")
  readonly goalkeeper = input(false)

  private readonly id = nextJerseyId++

  protected readonly shadeId = computed(() => `jersey-shade-${this.id}`)
  protected readonly textureId = computed(() => `jersey-texture-${this.id}`)
  protected readonly fill = computed(() => (this.goalkeeper() ? "#3aa84a" : this.color()))
  protected readonly textColor = computed(() => (this.goalkeeper() ? "#ffffff" : this.numberColor()))
  protected readonly textOutline = computed(() => (this.goalkeeper() ? "#1d6b2a" : "#ffffff"))
}
