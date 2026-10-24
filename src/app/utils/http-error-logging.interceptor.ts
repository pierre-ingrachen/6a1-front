import { HttpInterceptorFn } from "@angular/common/http"
import { inject } from "@angular/core"
import { catchError, throwError } from "rxjs"
import { DEV_MODE } from "utils/dev-mode"

export const httpErrorLoggingInterceptor: HttpInterceptorFn = (request, next) => {
  const devMode = inject(DEV_MODE)
  return next(request).pipe(
    catchError((error: unknown) => {
      if (devMode) {
        console.error(`${request.method} ${request.urlWithParams} failed`, error)
      }
      return throwError(() => error)
    }),
  )
}
