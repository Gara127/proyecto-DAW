import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { EventCreatorComponent } from './event-creator/event-creator.component';
import { RouterModule } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeUserComponent } from './home-user/home-user.component';
import { TasksComponent } from './tasks/tasks.component';




@NgModule({
  declarations: [
    EventCreatorComponent,
    HomeUserComponent,
    TasksComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HomeRoutingModule,
    RouterModule,
    ReactiveFormsModule
    
  ],
  providers: [
    provideHttpClient(), // Mantén esto
  ],
})
export class HomeModule { }
