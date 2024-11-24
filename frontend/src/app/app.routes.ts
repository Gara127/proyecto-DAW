import { Routes } from '@angular/router';
import { LoginComponent } from './Modulos/auth/login/login.component';
import { AdmiHomeComponent } from './Modulos/auth/home-admi/home-admi.component';
import { EditUserComponent } from './Modulos/auth/edit-user/edit-user.component';
import { RegisterComponent } from './Modulos/auth/register/register.component';
import { EventCreatorComponent } from './Modulos/home/event-creator/event-creator.component';
import { ChangePassComponent } from './Modulos/auth/changePass/changePass.component';
import { HomeUserComponent } from './Modulos/home/home-user/home-user.component';



export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'home', component: AdmiHomeComponent },
    { path: 'edit-user/:id', component: EditUserComponent},
    { path: 'register', component: RegisterComponent },
    { path: 'event-creator', component: EventCreatorComponent},
    { path: 'home-user', component: HomeUserComponent }, 
    { path: 'change-password', component: ChangePassComponent}
];

