import { Injectable, inject } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from "rxjs"
import { Season } from "models/season.model"
import { ApiUrlService } from "services/api-url.service"

@Injectable({
  providedIn: "root",
})
export class SeasonService {
  private readonly http = inject(HttpClient)
  private readonly seasonUrl = inject(ApiUrlService).resolve("seasons")

  findAllSeasons(): Observable<Season[]> {
    return this.http.get<Season[]>(this.seasonUrl)
  }
}
