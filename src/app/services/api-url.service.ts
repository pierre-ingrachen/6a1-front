import { Injectable } from "@angular/core"
import { environment } from "../../environments/environment"

@Injectable({ providedIn: "root" })
export class ApiUrlService {
  private readonly baseUrl = environment.apiUrl.replace(/\/+$/, "")

  resolve(path: string): string {
    return `${this.baseUrl}/${path.replace(/^\/+/, "")}`
  }
}
