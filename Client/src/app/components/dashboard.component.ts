import { Component, OnInit, inject } from '@angular/core';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  loginSvc = inject(LoginService)
  router = inject(Router)

  ngOnInit(): void {
    this.loginSvc.dashboard().subscribe(
      result => {
        console.info(JSON.stringify(result));
      },
      error => {
        this.router.navigate(['/']).then(() => {
          alert(JSON.stringify(error.error));
        });
      }
    )
  }

  signout() {
    this.loginSvc.signout().subscribe(
      result => {
        alert(JSON.stringify(result));
        this.router.navigate(['/']).then(() => {
          location.reload();
        });
      }
    );
  }

}
