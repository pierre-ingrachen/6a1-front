import { HttpClient, provideHttpClient, withInterceptors } from "@angular/common/http"
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing"
import { TestBed } from "@angular/core/testing"
import { DEV_MODE } from "utils/dev-mode"
import { httpErrorLoggingInterceptor } from "utils/http-error-logging.interceptor"

describe("httpErrorLoggingInterceptor", () => {
  let http: HttpClient
  let controller: HttpTestingController

  function configure(devMode: boolean): void {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpErrorLoggingInterceptor])),
        provideHttpClientTesting(),
        { provide: DEV_MODE, useValue: devMode },
      ],
    })
    http = TestBed.inject(HttpClient)
    controller = TestBed.inject(HttpTestingController)
  }

  beforeEach(() => configure(true))

  afterEach(() => controller.verify())

  it("logs failed requests in development", () => {
    const consoleError = spyOn(console, "error")

    http.get("/teams").subscribe({ error: () => undefined })
    controller.expectOne("/teams").flush("boom", { status: 500, statusText: "Server Error" })

    expect(consoleError).toHaveBeenCalledTimes(1)
    expect(consoleError.calls.mostRecent().args[0]).toContain("GET /teams failed")
  })

  it("stays silent in production but still rethrows", () => {
    TestBed.resetTestingModule()
    configure(false)
    const consoleError = spyOn(console, "error")
    let status = 0

    http.get("/teams").subscribe({ error: (error) => (status = error.status) })
    controller.expectOne("/teams").flush("boom", { status: 500, statusText: "Server Error" })

    expect(consoleError).not.toHaveBeenCalled()
    expect(status).toBe(500)
  })

  it("rethrows the original error to the caller", () => {
    spyOn(console, "error")
    let status = 0

    http.get("/teams").subscribe({ error: (error) => (status = error.status) })
    controller.expectOne("/teams").flush("missing", { status: 404, statusText: "Not Found" })

    expect(status).toBe(404)
  })

  it("stays silent for successful requests", () => {
    const consoleError = spyOn(console, "error")

    http.get("/teams").subscribe()
    controller.expectOne("/teams").flush([])

    expect(consoleError).not.toHaveBeenCalled()
  })
})
