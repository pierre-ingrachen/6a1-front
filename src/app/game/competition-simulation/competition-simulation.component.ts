import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  OnInit,
  Output,
  computed,
  inject,
  input,
  signal,
} from "@angular/core"
import { takeUntilDestroyed } from "@angular/core/rxjs-interop"
import { EMPTY, Observable, Subject, concat, defer, interval, take, takeUntil, tap } from "rxjs"
import { GroupTableComponent } from "game/group-table/group-table.component"
import { MatchCardComponent } from "game/match-card/match-card.component"
import { MatchRowComponent } from "game/match-row/match-row.component"
import { CompetitionResult } from "game/models/competition.model"
import { Slot } from "game/models/game.model"
import { MatchStep } from "game/models/simulation.model"
import { roundLabel } from "game/utils/position-labels"
import { buildSimulationSteps } from "game/utils/simulation-steps"

const MINUTE_DURATION_MS = 90

@Component({
  selector: "competition-simulation",
  standalone: true,
  imports: [GroupTableComponent, MatchCardComponent, MatchRowComponent],
  templateUrl: "./competition-simulation.component.html",
  styleUrls: ["./competition-simulation.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompetitionSimulationComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef)
  private readonly skipClock$ = new Subject<void>()
  private readonly nextMatch$ = new Subject<void>()

  readonly result = input.required<CompetitionResult>()
  readonly squad = input.required<Slot[]>()
  @Output() readonly finished = new EventEmitter<void>()

  readonly roundLabel = roundLabel
  readonly steps = computed(() => buildSimulationSteps(this.result(), this.squad()))
  readonly stepIndex = signal(0)
  readonly minute = signal(0)
  readonly currentStep = computed<MatchStep | undefined>(() => this.steps()[this.stepIndex()])
  readonly currentMatchFinished = computed(() => {
    const step = this.currentStep()
    return !!step && this.minute() >= step.duration
  })
  readonly lastMatch = computed(() => this.stepIndex() === this.steps().length - 1)
  readonly playedMatches = computed(() =>
    this.steps()
      .slice(0, this.stepIndex() + (this.currentMatchFinished() ? 1 : 0))
      .map((step) => step.match),
  )
  readonly playedGroupMatches = computed(() => this.playedMatches().filter((match) => match.round === "GROUP_STAGE"))
  readonly playedKnockoutMatches = computed(() => this.playedMatches().filter((match) => match.round !== "GROUP_STAGE"))
  readonly groupStageOver = computed(
    () => this.playedGroupMatches().length === this.result().groupStage.matches.length,
  )

  ngOnInit(): void {
    concat(...this.steps().map((step, index) => this.play(step, index)))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ complete: () => this.finished.emit() })
  }

  skipClock(): void {
    this.skipClock$.next()
  }

  goToNextMatch(): void {
    this.nextMatch$.next()
  }

  skipAll(): void {
    this.finished.emit()
  }

  private play(step: MatchStep, index: number): Observable<unknown> {
    return concat(
      defer(() => {
        this.stepIndex.set(index)
        this.minute.set(0)
        return EMPTY
      }),
      interval(MINUTE_DURATION_MS).pipe(
        take(step.duration),
        tap((tick) => this.minute.set(tick + 1)),
        takeUntil(this.skipClock$),
      ),
      defer(() => {
        this.minute.set(step.duration)
        return this.nextMatch$.pipe(take(1))
      }),
    )
  }
}
