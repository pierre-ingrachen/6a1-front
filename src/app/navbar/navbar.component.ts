import { Component } from "@angular/core"
import { MatIconModule } from "@angular/material/icon"
import { RouterLink, RouterLinkActive } from "@angular/router"
import { Link } from "models/links.model"

const NAVIGATION_LINKS: readonly Link[] = [
  { name: "Jouer", href: "jeu", icon: "sports_soccer" },
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
  readonly links = NAVIGATION_LINKS
}
