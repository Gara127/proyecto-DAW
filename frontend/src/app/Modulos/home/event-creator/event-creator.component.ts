import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../Servicios/usuario.service';
import { Usuario } from '../../models/usuario.model';

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

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      location: ['', Validators.required],
      description: ['', Validators.required],
      participants: ['', Validators.required] 
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
      // Aquí puedes manejar el envío del formulario con la lista de participantes
      const eventData = {
        ...this.eventForm.value,
        participants: this.participants
      };
      console.log('Evento creado:', eventData);
    }
  }
}