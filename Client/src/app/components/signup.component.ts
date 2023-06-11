import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Register } from '../models';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  form!: FormGroup
  fb = inject(FormBuilder)
  loginSvc = inject(LoginService)
  router = inject(Router)

  ngOnInit(): void {
    this.form = this.createSignUpForm();
  }

  createSignUpForm(): FormGroup {
    return this.fb.group({
      name: this.fb.control<string>('', [ Validators.required ]),
      email: this.fb.control<string>('', [ Validators.required ]),
      password: this.fb.control<string>('', [ Validators.required ])
    });
  }

  register() {
    let signupData: Register = {
      name: this.form.value.name,
      email: this.form.value.email,
      password: this.form.value.password,
    };
    this.loginSvc.registerUser(signupData).subscribe(
      result => {
        alert(JSON.stringify(result));
        this.router.navigate(['/']).then(() => {
          location.reload();
        });
      },
      error => {
        alert(JSON.stringify(error.error));
        location.reload();
      }
    )
  }

  back() {
    this.router.navigate(['/']).then(() => {
      location.reload();
    });
  }

}
