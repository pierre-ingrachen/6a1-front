import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { RouterModule } from "@angular/router"
import { MatAutocompleteModule } from "@angular/material/autocomplete"
import { MatButtonToggleModule } from "@angular/material/button-toggle"
import { PlayerCompareComponent } from "compare/player-compare/player-compare.component"
import { PlayerSearchComponent } from "compare/player-search/player-search.component"
import { StatRowComponent } from "compare/stat-row/stat-row.component"

@NgModule({
  declarations: [PlayerCompareComponent, PlayerSearchComponent, StatRowComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonToggleModule,
    RouterModule.forChild([{ path: "", component: PlayerCompareComponent }]),
  ],
})
export class CompareModule {}
