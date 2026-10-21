import { catchError, map, Observable, of, startWith } from "rxjs"

export type LoadStatus = "idle" | "loading" | "loaded" | "error"

export interface LoadState<T> {
  status: LoadStatus
  data: T
}

export const idleState = <T>(data: T): LoadState<T> => ({ status: "idle", data })

export const loadingState = <T>(data: T): LoadState<T> => ({ status: "loading", data })

export function toLoadState<T>(source: Observable<T>, fallback: T): Observable<LoadState<T>> {
  return source.pipe(
    map((data): LoadState<T> => ({ status: "loaded", data })),
    catchError(() => of<LoadState<T>>({ status: "error", data: fallback })),
    startWith(loadingState(fallback)),
  )
}
