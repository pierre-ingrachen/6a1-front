import { ComponentFixture, TestBed, fakeAsync, discardPeriodicTasks, tick } from "@angular/core/testing"
import { CompetitionResult, MatchResult } from "game/models/competition.model"
import { MatchStep } from "game/models/simulation.model"
import { CompetitionSimulationComponent } from "game/competition-simulation/competition-simulation.component"
import { SIMULATION_SPEEDS, minuteDelayMs } from "game/utils/simulation-speed"

const FAST = SIMULATION_SPEEDS[2]

const clockMs = (minutes: number): number =>
  Array.from({ length: minutes }, (_, index) => minuteDelayMs(FAST, index + 1)).reduce((total, delay) => total + delay, 0)

const matchOf = (round: MatchResult["round"], overrides: Partial<MatchResult> = {}): MatchResult => ({
  round,
  opponent: { teamId: 1, teamName: "Rival", seasonLabel: "2020", rating: 80, players: [] },
  goalsFor: 1,
  goalsAgainst: 0,
  extraTime: false,
  penaltiesFor: null,
  penaltiesAgainst: null,
  won: true,
  ...overrides,
})

const stepOf = (match: MatchResult, shootoutLength = 0): MatchStep => ({
  label: match.round,
  match,
  goals: [{ minute: 10, side: "FOR", scorerName: "Striker" }],
  shootout: Array.from({ length: shootoutLength }, () => ({ side: "FOR" as const, takerName: "Kicker", scored: true })),
  duration: match.extraTime ? 120 : 90,
})

const steps = [
  stepOf(matchOf("GROUP_STAGE")),
  stepOf(matchOf("GROUP_STAGE")),
  stepOf(matchOf("GROUP_STAGE")),
  stepOf(matchOf("FINAL", { extraTime: true, goalsAgainst: 1, penaltiesFor: 1, penaltiesAgainst: 0 }), 2),
]

const result: CompetitionResult = {
  squadStrength: { attack: 80, defense: 80 },
  groupStage: { matches: steps.slice(0, 3).map((step) => step.match), standings: [], rank: 1 },
  knockoutMatches: [steps[3].match],
  outcome: "WINNER",
  champion: true,
}

describe("CompetitionSimulationComponent", () => {
  let fixture: ComponentFixture<CompetitionSimulationComponent>
  let finished: number

  const setup = () => {
    fixture = TestBed.createComponent(CompetitionSimulationComponent)
    fixture.componentRef.setInput("result", result)
    fixture.componentRef.setInput("steps", steps)
    finished = 0
    fixture.componentInstance.finished.subscribe(() => finished++)
    fixture.detectChanges()
    fixture.componentInstance.selectSpeed(FAST)
    fixture.detectChanges()
    tick(0)
  }

  const component = () => fixture.componentInstance

  it("waits for the user to move on once a match is over", fakeAsync(() => {
    setup()
    tick(clockMs(90))

    expect(component().currentMatchFinished()).toBeTrue()
    expect(component().stepIndex()).toBe(0)
    expect(component().playedSteps().length).toBe(1)
    discardPeriodicTasks()
  }))

  it("moves to the next match on demand", fakeAsync(() => {
    setup()
    tick(clockMs(90))

    component().goToNextMatch()
    tick(0)

    expect(component().stepIndex()).toBe(1)
    expect(component().minute()).toBe(0)
    discardPeriodicTasks()
  }))

  it("skips the remaining group matches and stops on the last one", fakeAsync(() => {
    setup()

    component().skipGroupStage()
    tick(0)

    expect(component().stepIndex()).toBe(2)
    expect(component().currentMatchFinished()).toBeTrue()
    expect(component().playedGroupSteps().length).toBe(3)
    expect(component().groupStage()).not.toBeNull()
    discardPeriodicTasks()
  }))

  it("plays the shootout kick by kick after extra time", fakeAsync(() => {
    setup()
    component().skipGroupStage()
    tick(0)
    component().goToNextMatch()
    tick(clockMs(120))

    expect(component().minute()).toBe(120)
    expect(component().currentMatchFinished()).toBeFalse()

    tick(FAST.kickMs)
    expect(component().kicksRevealed()).toBe(1)
    tick(FAST.kickMs)
    expect(component().kicksRevealed()).toBe(2)
    expect(component().currentMatchFinished()).toBeTrue()
    discardPeriodicTasks()
  }))

  it("slows the clock down at the end of the match", fakeAsync(() => {
    setup()
    tick(clockMs(80))
    expect(component().minute()).toBe(80)

    tick(FAST.minuteMs)
    expect(component().minute()).toBe(80)

    tick(minuteDelayMs(FAST, 81) - FAST.minuteMs)
    expect(component().minute()).toBe(81)
    discardPeriodicTasks()
  }))

  it("tracks our top scorer live", fakeAsync(() => {
    setup()
    tick(clockMs(90))

    expect(component().topScorer()).toEqual({ name: "Striker", goals: 1 })
    discardPeriodicTasks()
  }))

  it("emits once the last match is dismissed", fakeAsync(() => {
    setup()
    component().skipGroupStage()
    tick(0)
    component().goToNextMatch()
    tick(clockMs(120) + FAST.kickMs * 2)
    component().goToNextMatch()
    tick(0)

    expect(finished).toBe(1)
  }))
})
