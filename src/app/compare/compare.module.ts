import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { RouterModule } from "@angular/router"
import { MatAutocompleteModule } from "@angular/material/autocomplete"
import { MatIconModule } from "@angular/material/icon"
import { MatButtonToggleModule } from "@angular/material/button-toggle"
import { PlayerCompareComponent } from "compare/player-compare/player-compare.component"
import { PlayerPickerComponent } from "compare/player-picker/player-picker.component"
import { PlayerSearchComponent } from "compare/player-search/player-search.component"
import { StatRowComponent } from "compare/stat-row/stat-row.component"

@NgModule({
  declarations: [PlayerCompareComponent, PlayerPickerComponent, PlayerSearchComponent, StatRowComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonToggleModule,
    MatIconModule,
    RouterModule.forChild([{ path: "", component: PlayerCompareComponent }]),
  ],
})
export class CompareModule {}
