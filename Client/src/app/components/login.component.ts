import { Component, NgZone, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Login } from '../models';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';

declare const google: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  form!: FormGroup
  fb = inject(FormBuilder)
  loginSvc = inject(LoginService)
  router = inject(Router)
  ngZone = inject(NgZone)

  ngOnInit(): void {
    this.form = this.createLoginForm();
    (window as any).handleResponse = (response: any) => {
      console.info('handleResponse called with response: ', response);
      fetch('auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ credential: response.credential})
      })
      .then(response => response.json())
      .then(data => {
        console.info('data from /auth/login: ', data);
        this.ngZone.run(() => {
          this.router.navigate(['/dashboard']);
        })
      })
      .catch(error => {
        console.error('error from /auth/login: ', error);
      });
    }
  }

  createLoginForm(): FormGroup {
    return this.fb.group({
      email: this.fb.control<string>('', [ Validators.required ]),
      password: this.fb.control<string>('', [ Validators.required ]),
      remember: this.fb.control<boolean>(false)
    });
  }

  login() {

      let loginData: Login = {
        email: this.form.value.email,
        password: this.form.value.password,
      };
      this.loginSvc.authenticateLogin(loginData).subscribe(
        result => {
          alert(JSON.stringify(result));
          this.router.navigate(['/dashboard']);
        },
        error => {
          alert(JSON.stringify(error.error));
          this.router.navigate(['/']);
          location.reload();
        }
        )      
  };

  signup() {
    this.router.navigate(['/signup']);
  }

}
