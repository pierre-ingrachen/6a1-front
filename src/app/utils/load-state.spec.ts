import { fakeAsync, tick } from "@angular/core/testing"
import { delay, of, throwError } from "rxjs"
import { idleState, LoadState, toLoadState } from "utils/load-state"

describe("toLoadState", () => {
  const collect = <T>(source: ReturnType<typeof toLoadState<T>>): LoadState<T>[] => {
    const states: LoadState<T>[] = []
    source.subscribe((state) => states.push(state))
    return states
  }

  it("starts loading then emits the loaded data", () => {
    expect(collect(toLoadState(of([1, 2]), []))).toEqual([
      { status: "loading", data: [] },
      { status: "loaded", data: [1, 2] },
    ])
  })

  it("turns an error into an error state carrying the fallback", () => {
    expect(collect(toLoadState(throwError(() => new Error("boom")), ["fallback"]))).toEqual([
      { status: "loading", data: ["fallback"] },
      { status: "error", data: ["fallback"] },
    ])
  })

  it("keeps the stream usable after an error when nested in a switchMap", fakeAsync(() => {
    const states: LoadState<number[]>[] = []
    toLoadState(of([1]).pipe(delay(10)), []).subscribe((state) => states.push(state))
    tick(10)

    expect(states.map((state) => state.status)).toEqual(["loading", "loaded"])
  }))

  it("builds idle states", () => {
    expect(idleState(null)).toEqual({ status: "idle", data: null })
  })
})
