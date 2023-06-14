import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Login, Register } from "../models/login.models";
import { Observable } from "rxjs";

const URL_LOGIN = '/auth/login'
const URL_REGISTER = '/register'
const URL_DASHBOARD = '/dashboard'
const URL_SIGNOUT = '/signout'

@Injectable()
export class LoginService {

    http = inject(HttpClient)

    authenticateLogin(login: Login): Observable<string> {
        return this.http.post<string>(URL_LOGIN, login);
    }

    registerUser(signupData: Register): Observable<any> {
        return this.http.post<any>(URL_REGISTER, signupData);
    }

    dashboard(): Observable<any> {
        return this.http.get<any>(URL_DASHBOARD);
    }

    signout(): Observable<any> {
        return this.http.delete<any>(URL_SIGNOUT);
    }
    
}