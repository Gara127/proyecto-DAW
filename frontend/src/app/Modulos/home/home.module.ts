import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { EventCreatorComponent } from './event-creator/event-creator.component';
import { RouterModule } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VotingComponent } from './voting/voting.component';


@NgModule({
  declarations: [
    EventCreatorComponent,
    VotingComponent
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
