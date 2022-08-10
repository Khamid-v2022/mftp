import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  //checkLogin
  isLogged = new BehaviorSubject<boolean>(false);
  currentLogged = this.isLogged.asObservable();
  changeLoging(filter: any) {
    this.isLogged.next(filter);
  }

  //Configuration data
  configuration = new BehaviorSubject<Object>({});
  currentConfiguration = this.configuration.asObservable();
  changeConfiguration(filter: any) {
    this.configuration.next(filter);
  }

  //System Vars data
  systemVars = new BehaviorSubject<Object>({});
  currentSystemVars = this.systemVars.asObservable();
  changeSystemVars(filter: any) {
    this.systemVars.next(filter);
  }

  constructor(private http: HttpClient) {}
  callAPI0(form: FormData): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/application/api/api.php`,
      form
    );
  }
  callAPI(form: FormData): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/application/api/api.php`,
      form,
      { withCredentials: true }
    );
  }
  callAPIWithCredentials(form: FormData): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/application/api/api.php`,
      form,
      { withCredentials: true }
    );
  }
  download(key: any): Observable<any> {
    return this.http.get(
      `${environment.apiUrl}/application/api/download.php?fileKey=${key}`
    );
  }
  upload(form: any, data: any, uploadChunk: boolean): Observable<any> {
    if (!uploadChunk) {
      return this.http.post(
        `${environment.apiUrl}/application/api/upload-chunked.php?action=${data.action}&uploadId=${data.uploadId}`,
        form,
        { withCredentials: true }
      );
    } else {
      return this.http.post(
        `${environment.apiUrl}/application/api/upload.php?action=uploadFile&uploadId=${data.uploadId}`,
        form,
        { withCredentials: true }
      );
    }
  }  
  uploadChunk(form: any, data: any): Observable<any> {
    return this.http.post(
      `http://localhost/monster-app/application/api/upload-chunked.php?action=${data.action}&uploadId=${data.uploadId}`,
      form,
      { withCredentials: true }
    );
  }
  uploadMultiStage(data: any, file: any): Observable<any> {
    let headers = new HttpHeaders();
    headers.set('Content-Type', 'application/octet-stream');
    return this.http.post(
      `http://localhost/monster-app/application/api/upload-multistage.php?sessionKey=${data.sessionKey}`,
      file,
      { withCredentials: true, headers: headers }
    );
  }
}
