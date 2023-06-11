import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { LoginService } from './services/login.service';
import { SignupComponent } from './components/signup.component';
import { DashboardComponent } from './components/dashboard.component';
import { WithCredentialsInterceptor } from 'src/app/with.credentials.interceptor';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component:DashboardComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
]

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule, 
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes, { useHash: true })
  ],
  providers: [
    LoginService,
    { provide: HTTP_INTERCEPTORS, useClass: WithCredentialsInterceptor, multi:true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
