import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { AuthService, CommonService } from '../../../services';
// import { OverlayContainer } from '@angular/cdk/overlay';
import { IconName, IconPrefix } from '@fortawesome/fontawesome-common-types';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  ChmodDialogComponent,
  ErrorDialogComponent,
  WarningDialogComponent,
} from '../../dialog';
import { SimpleChanges } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
export interface MenuItem {
  name: string;
  action: string;
  tooltips: string;
  icon: IconName;
  type: IconPrefix;
  isOpen: boolean;
  isActive: boolean;
  isDisabled: boolean;
}

export interface MenuFooter {
  action: String;
  icon: String;
  isActive: Boolean;
  isDisabled: Boolean;
  isOpen: Boolean;
  name: String;
  tooltips: String;
  type: String;
}
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  private user: any;
  private ff: any;
  @Output() clickItemFooter: EventEmitter<Object> = new EventEmitter();
  @Input() choosenFF: any;
  @Input() footerItem: MenuFooter = {
    action: '',
    icon: '',
    isActive: false,
    isDisabled: false,
    isOpen: false,
    name: '',
    tooltips: '',
    type: '',
  };
  public mainMenuItems: Array<MenuItem> = [
    {
      name: 'Upload...',
      action: 'upload',
      tooltips: 'Upload...',
      icon: 'upload',
      type: 'fas',
      isOpen: false,
      isActive: false,
      isDisabled: false,
    },
    {
      name: 'Download',
      action: 'download',
      tooltips: 'Download',
      icon: 'download',
      type: 'fas',
      isOpen: false,
      isActive: true,
      isDisabled: false,
    },
    {
      name: 'Fetch File...',
      action: 'fetchfile',
      tooltips: 'Fetch File...',
      icon: 'cloud-arrow-down',
      type: 'fas',
      isOpen: false,
      isActive: false,
      isDisabled: false,
    },
    {
      name: 'New File/Folder...',
      action: 'newfilefolder',
      tooltips: 'New File/Folder...',
      icon: 'square-plus',
      type: 'far',
      isOpen: false,
      isActive: false,
      isDisabled: false,
    },
    {
      name: 'Show Editor',
      action: 'showeditor',
      tooltips: 'Show Editor',
      icon: 'pen-to-square',
      type: 'fas',
      isOpen: false,
      isActive: true,
      isDisabled: true,
    },
    {
      name: 'Cut',
      action: 'cut',
      tooltips: 'Cut',
      icon: 'scissors',
      type: 'fas',
      isOpen: false,
      isActive: true,
      isDisabled: false,
    },
    {
      name: 'Copy',
      action: 'copy',
      tooltips: 'Copy',
      icon: 'copy',
      type: 'far',
      isOpen: false,
      isActive: true,
      isDisabled: false,
    },
    {
      name: 'Paste',
      action: 'paste',
      tooltips: 'Paste',
      icon: 'paste',
      type: 'far',
      isOpen: false,
      isActive: true,
      isDisabled: false,
    },
    {
      name: 'Delete...',
      action: 'delete',
      tooltips: 'Delete...',
      icon: 'trash-can',
      type: 'fas',
      isOpen: false,
      isActive: true,
      isDisabled: false,
    },
    {
      name: 'CHMOD',
      action: 'chmod',
      tooltips: 'CHMOD',
      icon: 'key',
      type: 'fas',
      isOpen: false,
      isActive: true,
      isDisabled: false,
    },
  ];
  constructor(
    private commmonSerVice: CommonService,
    private authService: AuthService, // private overlayContainer: OverlayContainer,
    private modalService: NgbModal,
    private _sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.authService.configuration.subscribe((res: any) => {
      this.user = res;
      console.log(this.user);
    });
    // this.initFooter();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.choosenFF.firstChange) {
      if (changes.choosenFF.currentValue.isActive) {
        this.ff = changes.choosenFF.currentValue;
        for (let i of this.mainMenuItems) {
          if (
            i.action == 'download' ||
            i.action == 'cut' ||
            i.action == 'copy' ||
            i.action == 'delete' ||
            i.action == 'chmod'
          ) {
            i.isActive = false;
            i.isDisabled = false;
          }
        }
      } else {
        for (let i of this.mainMenuItems) {
          if (
            i.action == 'download' ||
            i.action == 'cut' ||
            i.action == 'copy' ||
            i.action == 'delete' ||
            i.action == 'chmod'
          ) {
            this.ff = changes.choosenFF.currentValue;
            i.isActive = true;
            i.isDisabled = false;
          }
        }
      }
    }

    // changes.prop contains the old and the new value...
  }
  downloadLink: any;
  async onClickMenuItem(item: MenuFooter): Promise<void> {
    switch (item.action) {
      case 'upload':
      case 'newfilefolder': {
        for (let i of this.mainMenuItems) {
          if (i.isOpen != item.isOpen) {
            i.isOpen = false;
          }
        }
        item.isOpen = !item.isOpen;
        this.footerItem = item;
        this.clickItemFooter.emit(this.footerItem);
        break;
      }
      case 'download': {
        if (!item.isActive) {
          const context = { remotePath: '/' + this.ff.name };
          const data = this.configuration('fetchFile', context);
          const result: any = await lastValueFrom(
            this.authService.callAPI(data)
          ).catch((err) => {
            console.log(err);
            let modalRef = this.modalService.open(ErrorDialogComponent, {
              windowClass: 'animated fadeInDown',
              size: 'md',
            });
            modalRef.componentInstance.error = err.error.errors[0];
          });
          console.log(result);
          if (result && result.success) {
            var n = result.fileKey;
            console.log(n);

            this.downloadLink = this._sanitizer.bypassSecurityTrustResourceUrl(
              `https://www.monstaftp.com/demo/application/api/download.php?fileKey=${n}`
            );
            console.log(this.downloadLink);
            this.downloadLink.target = '_blank';
            this.downloadLink.click();
          }
        }
        break;
      }
      case 'delete': {
        if (!item.isActive) {
          let modalRef = this.modalService.open(WarningDialogComponent, {
            windowClass: 'animated fadeInDown',
            size: 'md',
          });
          modalRef.componentInstance.text =
            'Are you sure you want to delete 1 item?';
          modalRef.result.then(async (res: any) => {
            if (res) {
              const context = { pathsAndTypes: [['/' + this.ff.name, false]] };
              const data = this.configuration('deleteMultiple', context);
              const result: any = await lastValueFrom(
                this.authService.callAPI(data)
              ).catch((err) => {
                let modalRef = this.modalService.open(ErrorDialogComponent, {
                  windowClass: 'animated fadeInDown',
                  size: 'md',
                });
                modalRef.componentInstance.error = err.error.errors[0];
              });
              if (result && result.success) {
              }
            }
          });
          break;
        }
        break;
      }
      case 'chmod': {
        if (!item.isActive) {
          let modalRef = this.modalService.open(ChmodDialogComponent, {
            windowClass: 'animated fadeInDown',
            size: 'md',
          });
        }
        break;
      }
    }
  }
  configuration(action: string, context: any) {
    let configuration = this.user;
    configuration.actionName = action;
    configuration.context = context;
    let data = new FormData();
    data.append('request', JSON.stringify(configuration));
    return data;
  }
  // initFooter(): void {
  //   this.commmonSerVice.toogleThemeS.asObservable().subscribe((state) => {
  //     if (state) {
  //       this.overlayContainer.getContainerElement().classList.add('dark-theme');
  //       this.themeColor = 'accent';
  //     } else {
  //       this.overlayContainer
  //         .getContainerElement()
  //         .classList.remove('dark-theme');
  //       this.themeColor = 'primary';
  //     }
  //   });
  // }
}
