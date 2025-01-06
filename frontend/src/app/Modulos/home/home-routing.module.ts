import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventCreatorComponent } from './event-creator/event-creator.component';
import { VotingComponent } from './voting/voting.component';

const routes: Routes = [
  { path: 'event-creator', component: EventCreatorComponent},
  { path: 'voting', component: VotingComponent } // Nueva ruta para VotingComponent
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
