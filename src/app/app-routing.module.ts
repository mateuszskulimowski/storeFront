import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StoreComponent } from './components/store/store.component';
import { StoreComponentModule } from './components/store/store.component-module';

const routes: Routes = [{ path: '', component: StoreComponent }];

@NgModule({
  imports: [RouterModule.forRoot(routes), StoreComponentModule],
  exports: [RouterModule],
})
export class AppRoutingModule { }
