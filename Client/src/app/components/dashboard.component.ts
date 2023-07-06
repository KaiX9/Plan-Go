import { Component, OnInit, inject } from '@angular/core';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthenticateErrorComponent } from './dialogs/authenticate-error.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  loginSvc = inject(LoginService);
  router = inject(Router);
  dialog = inject(MatDialog);

  ngOnInit(): void {
    this.loginSvc.dashboard().subscribe(
      result => {
        console.info(JSON.stringify(result));
      },
      error => {
        if (error) {
          this.router.navigate(['/']).then(() => {
            const errorMessage = error.error.error;
            this.dialog.open(AuthenticateErrorComponent, {
              data: { message: errorMessage }
            });
          });
        }
      }
    );
  }
}