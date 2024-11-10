import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventCreatorComponent } from './event-creator/event-creator.component';

const routes: Routes = [
  { path: 'event-creator', component: EventCreatorComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
