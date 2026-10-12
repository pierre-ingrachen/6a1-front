const PREFERRED_NUMBERS: Record<string, number[]> = {
  GK: [1],
  RB: [2, 12],
  RWB: [2, 12],
  LB: [3, 13],
  LWB: [3, 13],
  CB: [4, 5, 15, 25],
  CM: [8, 6, 16, 14, 18],
  AM: [10, 17, 20],
  LW: [11, 21],
  RW: [7, 27],
  ST: [9, 19, 29],
}

const FIRST_FALLBACK_NUMBER = 30

export const assignJerseyNumbers = (positions: string[]): number[] =>
  positions.reduce<number[]>((assigned, position) => {
    const preferred = (PREFERRED_NUMBERS[position] ?? []).find((number) => !assigned.includes(number))
    return [...assigned, preferred ?? nextFreeNumber(assigned)]
  }, [])

const nextFreeNumber = (assigned: number[]): number =>
  Array.from({ length: 70 }, (_, index) => FIRST_FALLBACK_NUMBER + index).find((number) => !assigned.includes(number)) ??
  FIRST_FALLBACK_NUMBER
