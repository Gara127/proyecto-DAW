import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventCreatorComponent } from './event-creator/event-creator.component';
import { HomeUserComponent } from './home-user/home-user.component'; // Importa el componente principal
import { TasksComponent } from './tasks/tasks.component';
import { PruebaComponent } from './prueba/prueba.component';

const routes: Routes = [
  { path: '', component: HomeUserComponent }, // Ruta principal del módulo Home
  { path: 'event-creator', component: EventCreatorComponent }, // Añadida la ruta delboton crear evento de la HOME
  { path: 'tasks', loadComponent: () => import('./tasks/tasks.component').then(m => m.TasksComponent) },
  { path: 'prueba', component: TasksComponent } // Ruta para cargar el módulo de tareas
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {}

