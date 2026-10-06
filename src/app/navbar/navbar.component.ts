import { Component } from "@angular/core"
import { Link } from "models/links.model"

@Component({
  selector: "navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent {
  links: Link[] = [
    { name: "Accueil", href: "" },
    { name: "Étudiants", href: "etudiants" },
    { name: "Filières", href: "filieres" },
  ]
}
