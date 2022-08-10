import {
  Component,
  OnInit,
  EventEmitter,
  HostListener,
  ElementRef,
  Output,
  Input,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ClipboardService } from 'ngx-clipboard';
import { lastValueFrom } from 'rxjs';
import { AuthService } from 'services';
import {
  ChmodDialogComponent,
  EditDialogComponent,
  ErrorDialogComponent,
  NewDialogComponent,
  PropertiesDialogComponent,
  TransferDialogComponent,
  WarningDialogComponent,
} from '../../dialog';

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss'],
})
export class ContextMenuComponent implements OnInit {
  @Input() contextMenuEvent: any;
  @Input() contextMenuSelector: any;
  @Input() contextMenuItems: any;
  @Input() actionMenu: any;
  @Input() currentUser: any;
  @Input() itemTargetMultiDelete: any;
  @Input() arrFolderFile: any;
  @Output() changeAction: EventEmitter<any> = new EventEmitter();
  @Input() isAction: boolean = false;
  @Input() index: number;
  isDisplayContextMenu: boolean = false;
  _currentMenuVisible = null;

  constructor(
    private elementRef: ElementRef,
    private modalService: NgbModal,
    private authService: AuthService,
    private clipboardService: ClipboardService
  ) {
    this.isDisplayContextMenu = false;
  }

  ngOnInit() {
    this.initContextMenu();
  }

  initContextMenu() {
    if (this.contextMenuSelector && this.contextMenuEvent) {
      this.contextMenuEvent.preventDefault();
      this.contextMenuEvent.stopPropagation();
      this.createContextMenu(
        this.contextMenuEvent.clientX,
        this.contextMenuEvent.clientY
      );
      this.contextMenuSelector.addEventListener('click', (e: any) => {
        this.closeCurrentlyOpenedMenu();
      });
    }
  }

  createContextMenu(x: any, y: any) {
    this.closeCurrentlyOpenedMenu();
    this.isDisplayContextMenu = true;
    if (this.isDisplayContextMenu && this.elementRef.nativeElement) {
      const contextMenuDiv =
        this.elementRef.nativeElement.querySelector('.contextMenu');
      if (contextMenuDiv) {
        const heightMenu = this.contextMenuItems.length * 34 + 19;
        if (y > heightMenu) {
          this._currentMenuVisible = contextMenuDiv;
          contextMenuDiv.style.left = x + 'px';
          contextMenuDiv.style.top = y - heightMenu + 'px';
        } else {
          this._currentMenuVisible = contextMenuDiv;
          contextMenuDiv.style.left = x + 'px';
          contextMenuDiv.style.top = y + 'px';
        }
      }
    }
  }

  closeContextMenu(menu: any) {
    if (menu) {
      menu.style.left = '-10px';
      menu.style.top = '-30px';
      this._currentMenuVisible = null;
    }
  }

  closeCurrentlyOpenedMenu() {
    if (this._currentMenuVisible !== null) {
      this.closeContextMenu(this._currentMenuVisible);
    }
  }

  /* close context menu on left click */
  @HostListener('document:click')
  documentClick(): void {
    this.isDisplayContextMenu = false;
    this.closeContextMenu(this._currentMenuVisible);
  }

  /* close context menu on "ESC" key keypress */
  @HostListener('window:onkeyup')
  escKeyClick(): void {
    this.isDisplayContextMenu = false;
    this.closeContextMenu(this._currentMenuVisible);
  }
  async onContextMenuClick(event: any, item: any) {
    this.closeContextMenu(this._currentMenuVisible);
    switch (item.action) {
      case 'newfile':
      case 'newfolder': {
        let modalRef = this.modalService.open(NewDialogComponent, {
          windowClass: 'animated fadeInDown',
          size: 'md',
        });
        modalRef.componentInstance.action = item.action;
        modalRef.result.then(async (res: any) => {
          if (res.status) {
            if (item.action == 'newfolder') {
              const route = this.currentUser.context.path;
              const context = {
                remotePath:
                  route == '/' ? '/' + res.name : route + '/' + res.name,
              };
              const data = this.configuration('makeDirectory', context);
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
                this.changeAction.emit({ status: !this.isAction });
                this.isAction = false;
              }
            } else {
              const route = this.currentUser.context.path;
              const context = {
                remotePath:
                  route == '/' ? '/' + res.name : route + '/' + res.name,
                fileContents: '',
                originalFileContents: null,
                confirmOverwrite: false,
              };
              const data = this.configuration('putFileContents', context);
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
                let modalRefEdit = this.modalService.open(EditDialogComponent, {
                  windowClass: 'animated fadeInDown',
                  fullscreen: true,
                });
                modalRefEdit.componentInstance.language =
                  this.extractFileExtension(res.name);
                modalRefEdit.componentInstance.item = res;
                modalRefEdit.componentInstance.user = this.currentUser;
                modalRefEdit.result.then(async (ress: any) => {
                  if (ress.status) {
                    this.changeAction.emit({
                      status: !this.isAction,
                      isNewFile: true,
                    });
                    this.isAction = false;
                  }
                });
              }
            }
          }
        });
        break;
      }
      case 'extract': {
        const route = this.currentUser.context.path;
        const context = {
          remotePath:
            route == '/'
              ? '/' + this.actionMenu.name
              : route + '/' + this.actionMenu.name,
        };
        const data = this.configuration('downloadForExtract', context);
        const result: any = await lastValueFrom(
          this.authService.callAPIWithCredentials(data)
        ).catch((err) => {
          let modalRef = this.modalService.open(ErrorDialogComponent, {
            windowClass: 'animated fadeInDown',
            size: 'md',
          });
          modalRef.componentInstance.error = err.error.errors[0];
        });
        if (result && result.success) {
          let modalRef = this.modalService.open(TransferDialogComponent, {
            windowClass: 'animated fadeInDown',
            size: 'md',
          });
          modalRef.componentInstance.namefile = this.actionMenu.name;
          modalRef.componentInstance.fileKey = result.data.fileKey;
          modalRef.componentInstance.fileCount = result.data.fileCount;
          modalRef.componentInstance.user = this.currentUser;
          modalRef.result.then(async (res: any) => {
            if (res.status) {
              this.changeAction.emit({ status: !this.isAction });
              this.isAction = false;
            }
          });
        }
        break;
      }
      case 'zip': {
        let modalRef = this.modalService.open(NewDialogComponent, {
          windowClass: 'animated fadeInDown',
          size: 'md',
        });
        modalRef.componentInstance.action = item.action;
        modalRef.result.then(async (res: any) => {
          if (res.status) {
            let itemTargetMulti = [];
            for (let i of this.arrFolderFile) {
              if (i.isActive) {
                itemTargetMulti.push(i.name);
              }
            }
            const route = this.currentUser.context.path;
            const context = {
              baseDirectory: route,
              items: itemTargetMulti,
              dest: res.name,
            };
            const data = this.configuration('createZip', context);
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
              this.changeAction.emit({ status: !this.isAction });
              this.isAction = false;
            }
          }
        });
        break;
      }
      case 'download': {
        this.changeAction.emit({ status: !this.isAction, isDownLoad: true });
        this.isAction = false;
        break;
      }
      case 'edit': {
        this.changeAction.emit({ status: !this.isAction, isEdit: true });
        this.isAction = false;
        break;
      }
      case 'open': {
        this.changeAction.emit({ status: !this.isAction, isOpen: true });
        this.isAction = false;
        break;
      }
      case 'copyname': {
        this.clipboardService.copyFromContent(this.actionMenu.name);
        break;
      }
      case 'cut': {
        this.changeAction.emit({ status: !this.isAction, isCut: true });
        this.isAction = false;
        break;
      }
      case 'copy': {
        this.changeAction.emit({ status: !this.isAction, isCopy: true });
        this.isAction = false;
        break;
      }
      case 'paste': {
        this.changeAction.emit({ status: !this.isAction, isPaste: true });
        this.isAction = false;
        break;
      }
      case 'open': {
        console.log(this.actionMenu);
        break;
      }
      case 'rename': {
        let modalRef = this.modalService.open(NewDialogComponent, {
          windowClass: 'animated fadeInDown',
          size: 'md',
        });
        modalRef.componentInstance.action = item.action;
        modalRef.componentInstance.oldName = this.actionMenu.name;
        modalRef.result.then(async (res: any) => {
          if (res.status) {
            const route = this.currentUser.configuration.initialDirectory;
            const context = {
              source:
                route == '/'
                  ? '/' + this.actionMenu.name
                  : route + '/' + this.actionMenu.name,
              destination:
                route == '/' ? '/' + res.name : route + '/' + res.name,
            };
            const data = this.configuration('rename', context);
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
              this.changeAction.emit({ status: !this.isAction });
              this.isAction = false;
            }
          }
        });
        break;
      }
      case 'delete': {
        this.changeAction.emit({ status: !this.isAction, isDelete: true });
        this.isAction = false;
        break;
      }
      case 'properties': {
        let modalRef = this.modalService.open(PropertiesDialogComponent, {
          windowClass: 'animated fadeInDown',
          size: 'md',
        });
        modalRef.componentInstance.properties = this.actionMenu;
        break;
      }
      case 'chmod': {
        this.changeAction.emit({ status: !this.isAction, isCHMOD: true });
        this.isAction = false;
        break;
      }
    }
  }
  configuration(action: string, context: any) {
    const configuration = {
      connectionType: 'ftp',
      configuration: this.currentUser.configuration,
      actionName: action,
      context: context,
    };

    let dataF = new FormData();
    dataF.append('request', JSON.stringify(configuration));
    return dataF;
  }

  extractFileExtension(e: string) {
    if ('string' != typeof e) return '';
    var t = e.split('.');
    return 1 == t.length || (2 == t.length && '' == t[0])
      ? ''
      : t[t.length - 1].toLowerCase();
  }
  checkCopyName(copyItem: any, arrFolderFile: any) {
    const copyFileName = copyItem.name;
    let newName = this.newName(copyFileName, arrFolderFile);
    return newName;
  }

  newName(copyFileName: string, arrFolderFile: any) {
    let newName;
    const typeFile = this.extractFileExtension(copyFileName);
    if (typeFile == '') {
      newName = copyFileName;
    } else {
      newName = copyFileName.split('.').slice(0, -1).join('.');
    }
    let hasCopied = false;
    for (let file of arrFolderFile) {
      if (file.name == copyFileName) {
        hasCopied = true;
      }
    }
    let copyName = this.checkName(
      newName,
      1,
      arrFolderFile,
      typeFile,
      hasCopied
    );
    if (typeFile == '') {
      return copyName;
    } else {
      return copyName + '.' + typeFile;
    }
  }

  checkName(
    name: string,
    i: number,
    arrNames: any,
    typeFile: string,
    hasCopied: boolean
  ): any {
    let hasName = false;
    let orginalName;
    if (typeFile == '') {
      orginalName = name;
    } else {
      orginalName = name + '.' + typeFile;
    }
    for (let file of arrNames) {
      if (file.name === orginalName) {
        hasName = true;
        break;
      }
    }
    if (!hasName) {
      return name;
    } else {
      let split = name.split(' ');
      if (hasCopied && split[split.length - 1] == 'Copy') {
        name = name + ' 2';
        return this.checkName(name, 2, arrNames, typeFile, hasCopied);
      } else if (
        hasCopied &&
        split[split.length - 2] == 'Copy' &&
        Number(split[split.length - 1]) == i
      ) {
        split = split.slice(0, -1);
        let num = i + 1;
        name = split.join(' ') + ' ' + num;
        return this.checkName(name, num, arrNames, typeFile, hasCopied);
      } else {
        name = name + ' - Copy';
        return this.checkName(name, 1, arrNames, typeFile, hasCopied);
      }
    }
  }
}
