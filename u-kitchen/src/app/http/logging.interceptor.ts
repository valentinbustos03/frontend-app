import { HttpEvent, HttpEventType, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { Observable, tap } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";
import { inject } from "@angular/core";

export function loggingInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const _snackBar = inject(MatSnackBar);
  _snackBar.open(req.url, 'Ok', {
    duration: 3000
  })
  return next(req);
}

// export function loggingInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
//   return next(req).pipe(tap(event => {
//     // console.log(event)
//     if (event.type === HttpEventType.Response) {
//       console.log('hola')
//       // console.log(req.url, 'returned a response with status', event.status);
//       // console.log(req)
//     }
//   }));
// }