import { Component, EventEmitter, Input, Output } from "@angular/core"
import { PlayerSearchResult } from "models/player-search-result.model"
import { SeasonOption } from "models/season.model"

@Component({
  selector: "player-picker",
  templateUrl: "./player-picker.component.html",
  styleUrls: ["./player-picker.component.scss"],
})
export class PlayerPickerComponent {
  @Input({ required: true }) inputId!: string
  @Input({ required: true }) label!: string
  @Input() seasons: SeasonOption[] = []
  @Input() selectedSeason: number | null = null
  @Input() selectedName: string | null | undefined = null
  @Input() hasPlayer = false
  @Output() playerSelected = new EventEmitter<PlayerSearchResult>()
  @Output() seasonSelected = new EventEmitter<number>()
}
