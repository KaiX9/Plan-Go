import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Login, Register } from "../models/login.models";
import { Observable } from "rxjs";

const URL_LOGIN = '/auth/login';
const URL_REGISTER = '/register';
const URL_DASHBOARD = '/dashboard';
const URL_AUTOCOMPLETE = '/autocomplete';
const URL_SIGNOUT = '/signout';
const URL_GUIDE = '/guide';
const URL_GUIDES_LIST = '/guide/list';
const URL_USER_GUIDES = 'userGuides';

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
    
    autocomplete(): Observable<any> {
        return this.http.get<any>(URL_AUTOCOMPLETE);
    }

    guide(): Observable<any> {
        return this.http.get<any>(URL_GUIDE);
    }

    guidesList(): Observable<any> {
        return this.http.get<any>(URL_GUIDES_LIST);
    }

    userGuides(): Observable<any> {
        return this.http.get<any>(URL_USER_GUIDES);
    }
}