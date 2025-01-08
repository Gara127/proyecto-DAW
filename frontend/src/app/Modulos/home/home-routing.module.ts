import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventCreatorComponent } from './event-creator/event-creator.component';
import { HomeUserComponent } from './home-user/home-user.component'; // Importa el componente principal


const routes: Routes = [
  { path: '', component: HomeUserComponent }, // Ruta principal del módulo Home
  { path: 'event-creator', component: EventCreatorComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {}

