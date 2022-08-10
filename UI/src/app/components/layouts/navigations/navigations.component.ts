import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  Input,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, CommonService } from 'src/app/services';
import { IconName, IconPrefix } from '@fortawesome/fontawesome-common-types';
import { Subscription } from 'rxjs';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import {
  AddOnsDialogComponent,
  ErrorDialogComponent,
  LoginDialogComponent,
  SettingDialogComponent,
  WarningDialogComponent,
} from '../../dialog';
import { ChangeDetectorRef } from '@angular/core';
import { lastValueFrom } from 'rxjs';

export interface MenuItem {
  name: string;
  action: string;
  tooltips: string;
  icon: IconName;
  type: IconPrefix;
  isActive: boolean;
}
export const deprecatedComponentList = ['Tabset'];
@Component({
  selector: 'app-navigations',
  templateUrl: './navigations.component.html',
  styleUrls: ['./navigations.component.scss'],
})
export class NavigationsComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  @Output() clickItem: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() collapseChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() collapse: boolean = false;
  @Input() mobile: boolean = false;
  @Output() toggleChange: EventEmitter<any> = new EventEmitter();
  @Input() toggle: boolean = true;
  systemVars: any;
  title: any;
  public mainMenuItems: Array<MenuItem> = [
    {
      name: 'Logout',
      action: 'logout',
      tooltips: 'Log Out...',
      icon: 'right-to-bracket',
      type: 'fas',
      isActive: true,
    },
    {
      name: 'Login',
      action: 'login',
      tooltips: 'Log in to another server',
      icon: 'server',
      type: 'fas',
      isActive: true,
    },
    {
      name: 'Settings',
      action: 'settings',
      tooltips: 'Settings',
      icon: 'gear',
      type: 'fas',
      isActive: true,
    },
    {
      name: 'Add-ons',
      action: 'addons',
      tooltips: 'Add-ons',
      icon: 'puzzle-piece',
      type: 'fas',
      isActive: true,
    },
    {
      name: 'Help',
      action: 'help',
      tooltips: 'Help',
      icon: 'life-ring',
      type: 'fas',
      isActive: true,
    },
  ];
  constructor(
    private router: Router,
    private authServices: AuthService,
    private modalService: NgbModal,
    config: NgbModalConfig,
    private commonService: CommonService,
    private eRef: ElementRef,
    private cd: ChangeDetectorRef
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  async ngOnInit(): Promise<void> {
    if (!this.commonService.isAuthenticated()) {
      this.onClickMenuItem('login');
    } else {
      this.toggleChange.emit(!this.toggle);
      const configuration: any = localStorage.getItem('monsta-configuration');
      if (!configuration) {
        this.onClickMenuItem('login');
      }
      let ftp = JSON.parse(configuration).ftp;
      let logindata = {
        configuration: {
          passive: ftp.passive,
          username: ftp.username,
          password: ftp.password,
          host: ftp.host,
          initialDirectory: '/',
          port: 21,
        },
        connectionType: 'ftp',
        actionName: 'testConnectAndAuthenticate',
        context: { getServerCapabilities: true },
      };
      let data = new FormData();
      data.append('request', JSON.stringify(logindata));
      const result = await lastValueFrom(
        this.authServices.callAPI0(data)
      ).catch((err) => {
        let modalRef = this.modalService.open(ErrorDialogComponent, {
          windowClass: 'animated fadeInDown',
          size: 'md',
        });
        modalRef.componentInstance.error = err.error.errors[0];
      });
      if (result.data.serverCapabilities.changePermissions) {
        this.authServices.changeConfiguration({
          configuration: {
            passive: ftp.passive,
            username: ftp.username,
            password: ftp.password,
            host: ftp.host,
            initialDirectory: '/',
            port: 21,
          },
          connectionType: 'ftp',
          actionName: 'listDirectory',
          context: { path: '/', showHidden: true },
        });
        let dataSystemVars = new FormData();
        dataSystemVars.append(
          'request',
          '{"connectionType":null,"configuration":null,"actionName":"getSystemVars","context":{}}'
        );
        const systemVars: any = await lastValueFrom(
          this.authServices.callAPI(dataSystemVars)
        ).catch((err) => {
          let modalRef = this.modalService.open(ErrorDialogComponent, {
            windowClass: 'animated fadeInDown',
            size: 'md',
          });
          modalRef.componentInstance.error = err.error.errors[0];
        });
        if (systemVars.success) {
          this.systemVars = systemVars.data;
          this.authServices.changeSystemVars(this.systemVars);
          // this.openInfo();
          if (!this.systemVars.applicationSettings.sidebarItemDisplay.addons) {
            this.mainMenuItems[3].isActive = false;
          }
        }
        let dataReadLicense = new FormData();
        dataReadLicense.append(
          'request',
          '{"connectionType":null,"configuration":null,"actionName":"readLicense","context":{}}'
        );
        const readLicense: any = await lastValueFrom(
          this.authServices.callAPI(dataReadLicense)
        ).catch((err) => {
          let modalRef = this.modalService.open(ErrorDialogComponent, {
            windowClass: 'animated fadeInDown',
            size: 'md',
          });
          modalRef.componentInstance.error = err.error.errors[0];
        });
      }
    }
  }
  onClickMenuItem(action?: string): void {
    this.clickItem.emit(true);
    this.toggleChange.emit(!this.toggle);
    switch (action) {
      case 'logout': {
        let modalRef = this.modalService.open(WarningDialogComponent, {
          windowClass: 'animated fadeInDown',
          size: 'md',
        });
        modalRef.componentInstance.text = 'Are you sure you want to log out?';
        modalRef.result.then((res: any) => {
          if (res) {
            localStorage.clear();
            this.authServices.changeLoging(false);
            let modalRefL = this.modalService.open(LoginDialogComponent, {
              windowClass: 'animated fadeInDown',
              size: 'md',
            });
            modalRefL.result.then((resL: any) => {
              if (resL) {
                this.authServices.changeLoging(true);
              }
            });
          }
        });
        break;
      }
      case 'login': {
        const remember = localStorage.getItem('monsta-rememberLogin');
        const configuration: any = localStorage.getItem('monsta-configuration');
        let modalRef = this.modalService.open(LoginDialogComponent, {
          windowClass: 'animated fadeInDown',
          size: 'md',
        });
        if (remember == 'true') {
          let ftp = JSON.parse(configuration).ftp;
          modalRef.componentInstance.configuration = ftp;
          modalRef.componentInstance.rememberLS = true;
        } else {
          modalRef.componentInstance.rememberLS = false;
        }
        modalRef.result.then(async (res: any) => {
          if (res) {
            let dataSystemVars = new FormData();
            dataSystemVars.append(
              'request',
              '{"connectionType":null,"configuration":null,"actionName":"getSystemVars","context":{}}'
            );
            const systemVars: any = await lastValueFrom(
              this.authServices.callAPI(dataSystemVars)
            ).catch((err) => {
              let modalRef = this.modalService.open(ErrorDialogComponent, {
                windowClass: 'animated fadeInDown',
                size: 'md',
              });
              modalRef.componentInstance.error = err.error.errors[0];
            });
            if (systemVars.success) {
              this.systemVars = systemVars.data;
              this.authServices.changeSystemVars(this.systemVars);
              // this.openInfo();
              if (
                !this.systemVars.applicationSettings.sidebarItemDisplay.addons
              ) {
                this.mainMenuItems[3].isActive = false;
              }
            }
            let dataReadLicense = new FormData();
            dataReadLicense.append(
              'request',
              '{"connectionType":null,"configuration":null,"actionName":"readLicense","context":{}}'
            );
            const readLicense: any = await lastValueFrom(
              this.authServices.callAPI(dataReadLicense)
            ).catch((err) => {
              let modalRef = this.modalService.open(ErrorDialogComponent, {
                windowClass: 'animated fadeInDown',
                size: 'md',
              });
              modalRef.componentInstance.error = err.error.errors[0];
            });
            this.authServices.changeLoging(true);
          }
        });
        break;
      }
      case 'settings': {
        let modalRef = this.modalService.open(SettingDialogComponent, {
          windowClass: 'animated fadeInDown',
          size: 'md',
        });
        break;
      }
      case 'addons': {
        let modalRef = this.modalService.open(AddOnsDialogComponent, {
          windowClass: 'animated fadeInDown',
          size: 'md',
        });
        break;
      }
      case 'help': {
        window.open('https://www.monstaftp.com/contact', '_blank');
        break;
      }
      default: {
        break;
      }
    }
  }
  clickCollapse() {
    this.collapseChange.emit(!this.collapse);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
