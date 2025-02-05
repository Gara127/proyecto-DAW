import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventCreatorComponent } from './event-creator/event-creator.component';
import { VotingComponent } from './voting/voting.component';
import { HomeUserComponent } from './home-user/home-user.component'; // Importa el componente principal


const routes: Routes = [
  { path: '', component: HomeUserComponent },                   // Ruta principal del módulo Home
  { path: 'event-creator', component: EventCreatorComponent },  // Añadida la ruta delboton crear evento de la HOME
  { path: 'voting', component: VotingComponent }                // Nueva ruta para VotingComponent
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {}
