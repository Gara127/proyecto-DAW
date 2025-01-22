import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { EventCreatorComponent } from './event-creator/event-creator.component';
import { RouterModule } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VotingComponent } from './voting/voting.component';
import { HomeUserComponent } from './home-user/home-user.component';

@NgModule({
  declarations: [
    EventCreatorComponent,
    VotingComponent,
    HomeUserComponent
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
