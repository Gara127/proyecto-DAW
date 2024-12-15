import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-user.component.html',
  styleUrls: ['./home-user.component.css']
})
export class HomeUserComponent {
  username: string | null = null; // para login usuario

  constructor(private router: Router) {}
  navigateToCreateEvent(): void {
    this.router.navigate(['/event-creator']); // Cambia '/crear-evento' según la ruta que hayas definido
  }
  ngOnInit() {
    this.username = localStorage.getItem('username');
  }

}

