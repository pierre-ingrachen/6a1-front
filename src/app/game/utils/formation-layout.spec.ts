import { Line, Slot } from "game/models/game.model"
import { FORMATION_LAYOUTS, PitchPoint, pitchPointsOf } from "game/utils/formation-layout"

const FORMATIONS = ["4-3-3", "4-4-2", "4-2-3-1", "3-5-2", "5-3-2"]
const PITCH_MARGIN = 5
const TOKEN_WIDTH = 16
const TOKEN_HEIGHT = 12

const overlaps = (first: PitchPoint, second: PitchPoint): boolean =>
  Math.abs(first.x - second.x) < TOKEN_WIDTH && Math.abs(first.y - second.y) < TOKEN_HEIGHT

const overlappingPairs = (points: PitchPoint[]): string[] =>
  points.flatMap((first, firstIndex) =>
    points
      .slice(firstIndex + 1)
      .filter((second) => overlaps(first, second))
      .map((second) => `${JSON.stringify(first)} / ${JSON.stringify(second)}`),
  )

const slot = (index: number, position: string, line: Line): Slot => ({ index, position, line, player: null })

describe("formation layout", () => {
  FORMATIONS.forEach((formation) => {
    describe(formation, () => {
      const points = FORMATION_LAYOUTS[formation]

      it("has a point for each of its 11 slots", () => {
        expect(points?.length).toBe(11)
      })

      it("keeps every point inside the pitch", () => {
        const outside = points.filter(({ x, y }) => [x, y].some((value) => value < PITCH_MARGIN || value > 100 - PITCH_MARGIN))

        expect(outside).toEqual([])
      })

      it("never puts two tokens on top of each other", () => {
        expect(overlappingPairs(points)).toEqual([])
      })

      it("puts the goalkeeper alone at the bottom centre", () => {
        const [goalkeeper, ...outfield] = points

        expect(goalkeeper.x).toBe(50)
        expect(outfield.every((outfieldPoint) => outfieldPoint.y < goalkeeper.y)).toBeTrue()
      })
    })
  })

  it("reads the point of each slot from its index", () => {
    const slots = [slot(10, "RW", "ATTACKER"), slot(0, "GK", "GOALKEEPER")]

    expect(pitchPointsOf("4-3-3", slots)).toEqual([FORMATION_LAYOUTS["4-3-3"][10], FORMATION_LAYOUTS["4-3-3"][0]])
  })

  it("spreads slots of an unknown formation across their line without overlap", () => {
    const slots = [
      slot(0, "GK", "GOALKEEPER"),
      ...[1, 2, 3, 4, 5].map((index) => slot(index, "CB", "DEFENDER")),
      ...[6, 7, 8].map((index) => slot(index, "CM", "MIDFIELDER")),
      ...[9, 10].map((index) => slot(index, "ST", "ATTACKER")),
    ]

    const points = pitchPointsOf("9-0-1", slots)

    expect(points.length).toBe(11)
    expect(points[0]).toEqual({ x: 50, y: 91 })
    expect(overlappingPairs(points)).toEqual([])
  })
})
