import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header.component';

@NgModule({
  imports: [RouterModule],
  declarations: [HeaderComponent],
  providers: [],
  exports: [HeaderComponent]
})
export class HeaderComponentModule {
}
