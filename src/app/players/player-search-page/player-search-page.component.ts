import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { Router } from "@angular/router"
import { MatIconModule } from "@angular/material/icon"
import { PlayerSearchComponent } from "compare/player-search/player-search.component"
import { PlayerSearchResult } from "models/player-search-result.model"

@Component({
  selector: "player-search-page",
  standalone: true,
  imports: [MatIconModule, PlayerSearchComponent],
  templateUrl: "./player-search-page.component.html",
  styleUrls: ["./player-search-page.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerSearchPageComponent {
  private readonly router = inject(Router)

  openProfile(player: PlayerSearchResult): void {
    const latestSeason = Math.max(...player.seasons.map((season) => season.startYear))
    const queryParams = player.seasons.length > 0 ? { season: latestSeason } : {}
    this.router.navigate(["/joueurs", player.id], { queryParams })
  }
}
