import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { EventCreatorComponent } from './event-creator/event-creator.component';
import { RouterModule } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeUserComponent } from './home-user/home-user.component';



@NgModule({
  declarations: [
    EventCreatorComponent,
    HomeUserComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [
    provideHttpClient(), // Mantén esto
  ],
})
export class HomeModule { }
