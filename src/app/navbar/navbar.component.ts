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
    this.links.push({ name: "Étudiants", href: "etudiants", icon: "person" })
    this.links.push({ name: "Filières", href: "filieres", icon: "school" })
    this.links.push({ name: "Équipes & effectifs", href: "teams", icon: "groups" })
  }
}
