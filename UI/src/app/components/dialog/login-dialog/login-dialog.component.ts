import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { lastValueFrom } from 'rxjs';
import { AuthService } from 'services';

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss'],
})
export class LoginDialogComponent implements OnInit {
  @Input() configuration: any;
  @Input() rememberLS: boolean;
  public loginFormFTP: FormGroup;
  public loginFormSFTP: FormGroup;
  public submitted: boolean = false;
  public tab: number = 1;
  public authType: string = '';
  public Atype: string = '';
  public error: string = '';
  public loading: boolean = false;
  public remember: boolean = false;
  public authenticationTypeArr: any = [
    {
      id: 0,
      name: 'Password',
      value: 'password',
    },
    {
      id: 1,
      name: 'Public Key File',
      value: 'keyfile',
    },
    {
      id: 2,
      name: 'Agent',
      value: 'agent',
    },
  ];
  constructor(
    private modalActive: NgbActiveModal,
    private formBuilder: FormBuilder,
    private authServices: AuthService
  ) {}

  ngOnInit(): void {
    if (this.rememberLS) {
      this.initDataLogin();
    } else {
      this.initloginFormFTP();
    }
  }
  initDataLogin() {
    this.remember = true;
    this.loginFormFTP = this.formBuilder.group({
      connectionType: ['ftp'],
      configuration: this.formBuilder.group({
        passive: [this.configuration.passive],
        username: [this.configuration.username, Validators.required],
        password: [this.configuration.password, Validators.required],
        host: [this.configuration.host, Validators.required],
        initialDirectory: ['/'],
        ssl: [false],
        port: [21, Validators.required],
      }),
      actionName: ['testConnectAndAuthenticate'],
      context: {
        getServerCapabilities: true,
      },
    });
  }
  initloginFormFTP() {
    this.loginFormFTP = this.formBuilder.group({
      connectionType: ['ftp'],
      configuration: this.formBuilder.group({
        passive: [true],
        username: ['', Validators.required],
        password: ['', Validators.required],
        host: ['', Validators.required],
        initialDirectory: ['/'],
        ssl: [false],
        port: [21, Validators.required],
      }),
      actionName: ['testConnectAndAuthenticate'],
      context: {
        getServerCapabilities: true,
      },
    });
  }
  initloginFormSFTP() {
    this.loginFormSFTP = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }
  get fFTP() {
    return this.loginFormFTP.controls;
  }

  get fSFTP() {
    return this.loginFormSFTP.controls;
  }

  async tryLoginFTP(loginFormFTP: any) {
    this.submitted = true;
    this.error = '';
    if (this.loading) {
      return;
    }
    if (loginFormFTP.invalid) {
      return;
    }
    this.loading = true;
    let data = new FormData();
    data.append('request', JSON.stringify(loginFormFTP.value));
    const result: any = await lastValueFrom(
      this.authServices.callAPI0(data)
    ).catch((err) => {
      this.loading = false;
      this.error = err.error.errors[0];
    });
    if (result.data.serverCapabilities.changePermissions) {
      this.loading = false;
      localStorage.setItem('monsta-hasServerSavedAuthentication', 'true');
      localStorage.setItem('monsta-isAuthenticated', 'true');
      if (this.remember) {
        localStorage.setItem('monsta-rememberLogin', 'true');
        localStorage.setItem(
          'monsta-connectionType',
          this.fFTP.connectionType.value
        );
        const configuration = {
          ftp: {
            host: this.fFTP.configuration.value.host,
            initialDirectory: '/',
            passive: this.fFTP.configuration.value.passive,
            password: this.fFTP.configuration.value.password,
            username: this.fFTP.configuration.value.username,
          },
          sftp: {
            initialDirectory: this.fFTP.configuration.value.username,
            password: this.fFTP.configuration.value.password,
          },
        };
        localStorage.setItem(
          'monsta-configuration',
          JSON.stringify(configuration)
        );
      } else {
        localStorage.setItem('monsta-rememberLogin', 'false');
      }
      this.authServices.changeConfiguration({
        configuration: {
          passive: this.fFTP.configuration.value.passive,
          username: this.fFTP.configuration.value.username,
          password: this.fFTP.configuration.value.password,
          host: this.fFTP.configuration.value.host,
          initialDirectory: '/',
          port: 21,
        },
        connectionType: 'ftp',
        actionName: 'listDirectory',
        context: { path: '/', showHidden: true },
      });
      this.modalActive.close(true);
    }
  }
  tryLoginSFTP(loginFormSFTP: any) {
    this.submitted = true;

    // stop here if form is invalid
    if (loginFormSFTP.invalid) {
      return;
    }
  }

  close() {
    this.modalActive.close(false);
  }
  goTo() {
    window.open('https://www.monstaftp.com/', '_blank');
  }
  chooseTab(tab: number) {
    this.tab = tab;
    if (tab == 1) {
      this.initloginFormFTP();
    } else {
      this.initloginFormSFTP();
    }
  }
  changeAuthenticationType(item: any) {
    if (item.target.value == 'password') {
      this.authType = item.target.value;
    } else if (item.target.value == 'keyfile') {
      this.authType = item.target.value;
    } else {
      this.authType = '';
    }
  }
}
