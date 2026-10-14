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
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop"
import { EMPTY, Observable, Subject, concat, defer, interval, switchMap, take, takeUntil, takeWhile, tap } from "rxjs"
import { CompetitionRecapComponent } from "game/competition-recap/competition-recap.component"
import { MatchCardComponent } from "game/match-card/match-card.component"
import { CompetitionResult } from "game/models/competition.model"
import { MatchStep } from "game/models/simulation.model"
import { TopScorerCardComponent } from "game/top-scorer-card/top-scorer-card.component"
import { DEFAULT_SIMULATION_SPEED, SIMULATION_SPEEDS, SimulationSpeed } from "game/utils/simulation-speed"
import { topScorerOf } from "game/utils/top-scorer"

const isGroupStep = (step: MatchStep): boolean => step.match.round === "GROUP_STAGE"

@Component({
  selector: "competition-simulation",
  standalone: true,
  imports: [CompetitionRecapComponent, MatchCardComponent, TopScorerCardComponent],
  templateUrl: "./competition-simulation.component.html",
  styleUrls: ["./competition-simulation.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompetitionSimulationComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef)
  private readonly skipClock$ = new Subject<void>()
  private readonly skipGroupStage$ = new Subject<void>()
  private readonly nextMatch$ = new Subject<void>()
  private groupStageSkipped = false

  readonly result = input.required<CompetitionResult>()
  readonly steps = input.required<MatchStep[]>()
  @Output() readonly finished = new EventEmitter<void>()

  readonly speeds = SIMULATION_SPEEDS
  readonly speed = signal<SimulationSpeed>(DEFAULT_SIMULATION_SPEED)
  private readonly speedChanges$ = toObservable(this.speed)

  readonly stepIndex = signal(0)
  readonly minute = signal(0)
  readonly kicksRevealed = signal(0)

  readonly currentStep = computed<MatchStep | undefined>(() => this.steps()[this.stepIndex()])
  readonly currentMatchFinished = computed(() => {
    const step = this.currentStep()
    return !!step && this.minute() >= step.duration && this.kicksRevealed() >= step.shootout.length
  })
  readonly lastMatch = computed(() => this.stepIndex() === this.steps().length - 1)
  readonly lastGroupIndex = computed(() => this.steps().filter(isGroupStep).length - 1)
  readonly canSkipGroupStage = computed(() => {
    const step = this.currentStep()
    return !!step && isGroupStep(step) && this.stepIndex() < this.lastGroupIndex()
  })

  readonly playedSteps = computed(() => this.steps().slice(0, this.stepIndex() + (this.currentMatchFinished() ? 1 : 0)))
  readonly playedGroupSteps = computed(() => this.playedSteps().filter(isGroupStep))
  readonly playedKnockoutSteps = computed(() => this.playedSteps().filter((step) => !isGroupStep(step)))
  readonly groupStage = computed(() =>
    this.playedGroupSteps().length === this.result().groupStage.matches.length ? this.result().groupStage : null,
  )
  readonly topScorer = computed(() => {
    const current = this.currentStep()
    const previousGoals = this.steps()
      .slice(0, this.stepIndex())
      .flatMap((step) => step.goals)
    const currentGoals = current ? current.goals.filter((goal) => goal.minute <= this.minute()) : []
    return topScorerOf([...previousGoals, ...currentGoals])
  })

  ngOnInit(): void {
    concat(...this.steps().map((step, index) => this.play(step, index)))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ complete: () => this.finished.emit() })
  }

  selectSpeed(speed: SimulationSpeed): void {
    this.speed.set(speed)
  }

  skipClock(): void {
    this.skipClock$.next()
  }

  skipGroupStage(): void {
    this.groupStageSkipped = true
    this.skipGroupStage$.next()
  }

  goToNextMatch(): void {
    this.nextMatch$.next()
  }

  skipAll(): void {
    this.finished.emit()
  }

  private play(step: MatchStep, index: number): Observable<unknown> {
    return defer(() => {
      if (!isGroupStep(step)) {
        return this.playLive(step, index)
      }
      if (this.groupStageSkipped) {
        return index === this.lastGroupIndex() ? this.awaitNextMatch(step, index) : EMPTY
      }
      return this.playLive(step, index).pipe(takeUntil(this.skipGroupStage$))
    })
  }

  private playLive(step: MatchStep, index: number): Observable<unknown> {
    return concat(
      defer(() => {
        this.stepIndex.set(index)
        this.minute.set(0)
        this.kicksRevealed.set(0)
        return EMPTY
      }),
      this.clockOf(step),
      this.shootoutOf(step),
      this.awaitNextMatch(step, index),
    )
  }

  private awaitNextMatch(step: MatchStep, index: number): Observable<unknown> {
    return defer(() => {
      this.stepIndex.set(index)
      this.minute.set(step.duration)
      this.kicksRevealed.set(step.shootout.length)
      return this.nextMatch$.pipe(take(1))
    })
  }

  private clockOf(step: MatchStep): Observable<unknown> {
    return this.ticksEvery((speed) => speed.minuteMs).pipe(
      tap(() => this.minute.update((minute) => minute + 1)),
      takeWhile(() => this.minute() < step.duration),
      takeUntil(this.skipClock$),
    )
  }

  private shootoutOf(step: MatchStep): Observable<unknown> {
    if (step.shootout.length === 0) {
      return EMPTY
    }

    return this.ticksEvery((speed) => speed.kickMs).pipe(
      tap(() => this.kicksRevealed.update((revealed) => revealed + 1)),
      takeWhile(() => this.kicksRevealed() < step.shootout.length),
      takeUntil(this.skipClock$),
    )
  }

  private ticksEvery(periodOf: (speed: SimulationSpeed) => number): Observable<number> {
    return this.speedChanges$.pipe(switchMap((speed) => interval(periodOf(speed))))
  }
}
