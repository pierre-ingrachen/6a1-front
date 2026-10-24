import { Component, inject } from "@angular/core"
import { MatIconModule } from "@angular/material/icon"
import { Router, RouterLink, RouterLinkActive } from "@angular/router"
import { GameSessionService } from "game/services/game-session.service"
import { Link } from "models/links.model"

const GAME_HREF = "jeu"

const NAVIGATION_LINKS: readonly Link[] = [
  { name: "Jouer", href: GAME_HREF, icon: "sports_soccer" },
  { name: "Équipes", href: "teams", icon: "groups" },
  { name: "Comparer", href: "compare", icon: "compare_arrows" },
]

@Component({
  selector: "navbar",
  standalone: true,
  imports: [MatIconModule, RouterLink, RouterLinkActive],
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent {
  private readonly router = inject(Router)
  private readonly gameSession = inject(GameSessionService)
  readonly links = NAVIGATION_LINKS

  onLinkClicked(link: Link): void {
    if (link.href === GAME_HREF && this.router.url.split(/[?#]/)[0] === `/${GAME_HREF}`) {
      this.gameSession.requestNewGame()
    }
  }
}
