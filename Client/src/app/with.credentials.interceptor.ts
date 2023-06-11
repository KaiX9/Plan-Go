import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

export class WithCredentialsInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authReq = req.clone({
      withCredentials: true
    });
    return next.handle(authReq);
  }
}
