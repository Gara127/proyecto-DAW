import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../Servicios/usuario.service';
import { Usuario } from '../../models/usuario.model';
import { EventoService } from '../../Servicios/evento.service';

@Component({
  selector: 'app-event-creator',
  standalone: true,
  imports: [ReactiveFormsModule,FormsModule,CommonModule],
  templateUrl: './event-creator.component.html',
  styleUrl: './event-creator.component.css'
})

export class EventCreatorComponent implements OnInit {
  eventForm!: FormGroup;
  participants: Usuario[] = [];
  participantError: boolean = false;
  userService: any;
  username: string | null = null; // para login usuario

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private eventoService: EventoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username');
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      location: ['', Validators.required],
      description: ['', Validators.required],
      participants: ['',] 
    });
  }


  addParticipant(): void {
    const username = this.eventForm.get('participants')?.value;  

    if (!username) {
      this.participantError = true; // Si no hay nombre de usuario
      return;
    }
    this.usuarioService.obtenerUsuarioPorNombre(username).subscribe(
      (usuario: Usuario) => {
        this.participants.push(usuario); 
        this.eventForm.get('participants')?.setValue('');  // Limpiar el campo de participantes
        this.participantError = false; // Restablecer error si el usuario fue encontrado
      },
      (error: any) => {
        this.participantError = true; // Si el usuario no se encuentra
      }
    );
    console.log(this.participants);
  }


  onSubmit(): void {
    if (this.eventForm.valid) {
      const eventData = {
        title: this.eventForm.get('title')?.value,
        date: this.eventForm.get('date')?.value,
        time: this.eventForm.get('time')?.value,
        location: this.eventForm.get('location')?.value,
        description: this.eventForm.get('description')?.value,
        participants: this.participants.map(participant => participant.id_usuario) 
      };
  
      this.eventoService.crearEvento(eventData).subscribe(
        (response: any) => {
          console.log('Evento creado con éxito:', response);
          this.router.navigate(['./event-creator']); 
        },
        (error: any) => {
          console.error('Error al crear evento:', error);
          alert('Error al crear evento');
          console.log('Detalles del error:', error);
        }
      );
    } else {
      alert('Por favor, completa todos los campos requeridos.');
    }
  }
}  