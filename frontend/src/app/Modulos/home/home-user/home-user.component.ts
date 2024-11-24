import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-user',
  templateUrl: './home-user.component.html',
  styleUrls: ['./home-user.component.css']
})
export class HomeUserComponent {
  constructor(private router: Router) {}

  navigateToCreateEvent(): void {
    this.router.navigate(['/event-creator']); // Cambia '/crear-evento' según la ruta que hayas definido
  }
}

