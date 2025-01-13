import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../Servicios/usuario.service';
import { Usuario } from '../../models/usuario.model';
import { EventoService } from '../../Servicios/evento.service';
import { ActivatedRoute } from '@angular/router';


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
  userID: number = 0; // para login usuario

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private eventoService: EventoService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username');
    this.userID = parseInt(localStorage.getItem('id') || '0');
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      date: [''], 
      time: [''], 
      location: [''], 
      description: [''], 
      participants: [''] 
    });
    
    this.route.queryParams.subscribe(params => {
      if (params['id_evento']) {
        this.cargarEvento(params['id_evento']);
      }
    });
  }
  
  cargarEvento(id_evento: number): void {
    this.eventoService.obtenerEventoPorId(id_evento).subscribe(evento => {
      this.eventForm.patchValue(evento);
    });
  }

  addParticipant(): void {
    const username = this.eventForm.get('participants')?.value;  
    if (!username) {
      this.participantError = true;
      alert('Por favor introducir el nombre de un usuario.');
      return;
    }

    this.usuarioService.obtenerUsuarioPorNombre(username).subscribe(
      (usuario: Usuario) => {
        if (usuario.error) {
          this.participantError = true;
          alert('Este usuario no existe.');
          return;
        }

        if (!this.participants.some(participant => participant.id_usuario === usuario.id_usuario)) {
          this.participants.push(usuario);
          console.log('Respuesta completa del servicio:', usuario)
          console.log('Usuario añadido:', usuario.nombre);
        }else{
          alert("El usuario ya fue añadido al evento");
        }
        console.log('Participantes actualizados:', this.participants);
        this.eventForm.get('participants')?.setValue('');
      },
      (error: any) => {
        console.error('Error al agregar participante:', error);
        alert('Error al agregar participante.');
      }
    );
    console.log(this.participants);
  }

  removeParticipant(id: number): void {
    this.participants = this.participants.filter(participant => participant.id_usuario !== id);
  }

  onSubmit(): void {
    if (this.eventForm.get('title')?.valid) {
      const formData = this.eventForm.value;
      const eventData: any = {
        title: formData.title,
        date: formData.date || null,
        time: formData.time || null,
        location: formData.location || null,
        description: formData.description || null,
        participants: this.participants.map((usuario) => usuario.id_usuario), // Solo IDs
      };
  
      if (this.route.snapshot.queryParams['id_evento']) {
        eventData.id_evento = this.route.snapshot.queryParams['id_evento'];
      }
  
      if (eventData.id_evento) {
        this.eventoService.actualizarEvento(eventData).subscribe(
          (response) => {
            console.log('Evento actualizado con éxito:', response);
            alert('Evento actualizado con éxito.');
            this.router.navigate(['/home-user']);
          },
          (error) => {
            console.error('Error al actualizar evento:', error);
            alert('Error al actualizar evento.');
          }
        );
      } else {
        this.eventoService.crearEvento(eventData).subscribe(
          (response) => {
            console.log('Evento creado con éxito:', response);
            alert('Evento creado con éxito.');
            this.router.navigate(['/home-user']);
          },
          (error) => {
            console.error('Error al crear evento:', error);
            alert('Error al crear evento.');
          }
        );
      }
    } else {
      alert('El campo "Título" es obligatorio. Por favor, rellénalo antes de continuar.');
    }
  }
  
}  