import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from "rxjs"
import { Season } from "models/season.model"

@Injectable({
  providedIn: "root",
})
export class SeasonService {
  private seasonUrl = "http://localhost:8080/seasons"

  constructor(private http: HttpClient) {}

  findAllSeasons(): Observable<Season[]> {
    return this.http.get<Season[]>(this.seasonUrl)
  }
}
