import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdmiHomeComponent } from './home-admi/home-admi.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { RegisterComponent } from './register/register.component';



const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: AdmiHomeComponent },
  { path: 'edit-user/:id', component: EditUserComponent},
  { path: 'register', component: RegisterComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})


export class AuthRoutingModule { }
