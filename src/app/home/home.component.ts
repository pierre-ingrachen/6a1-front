import { Component } from "@angular/core"

interface HomeLink {
  title: string
  description: string
  href: string
  icon: string
}

@Component({
  selector: "home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent {
  readonly links: HomeLink[] = [
    { title: "Jouer", description: "Compose ton équipe en 11 tirages et lance la compétition.", href: "/jeu", icon: "sports_soccer" },
    { title: "Équipes", description: "Parcours les clubs et leurs effectifs saison par saison.", href: "/teams", icon: "groups" },
    { title: "Comparer", description: "Mets deux joueurs face à face, statistique par statistique.", href: "/compare", icon: "compare_arrows" },
  ]
}
