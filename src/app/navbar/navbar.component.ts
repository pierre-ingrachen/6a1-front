import { Component } from "@angular/core"
import { Link } from "models/links.model"

@Component({
  selector: "navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent {
  links: Link[] = []

  constructor() {
    this.links.push({ name: "Jouer", href: "jeu", icon: "sports_soccer" })
    this.links.push({ name: "Équipes", href: "teams", icon: "groups" })
    this.links.push({ name: "Comparer", href: "compare", icon: "compare_arrows" })
  }
}
