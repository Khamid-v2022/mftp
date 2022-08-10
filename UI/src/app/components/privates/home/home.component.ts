import {
  Component,
  OnInit,
  ViewContainerRef,
  ViewChild,
  ComponentFactoryResolver,
  ElementRef,
  EventEmitter,
  Output,
  Input,
  SimpleChanges,
} from '@angular/core';
import { ContextMenuComponent } from '../context-menu/context-menu.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'services';
import { MenuItem, FileFolder, MenuFooterItem } from 'src/app/interfaces';

import {
  ArchiveDialogComponent,
  ChmodDialogComponent,
  EditDialogComponent,
  ErrorDialogComponent,
  NewDialogComponent,
  PropertiesDialogComponent,
  UploadDialogComponent,
  WarningDialogComponent,
} from '../../dialog';
import { lastValueFrom } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public footerMenuItems: Array<MenuFooterItem> = [
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
  footerItem: MenuFooterItem = {
    action: '',
    icon: 'pen',
    isActive: false,
    isDisabled: false,
    isOpen: false,
    name: '',
    tooltips: '',
    type: 'fas',
  };
  arrNewFileFolder: Array<MenuItem> = [
    {
      menuText: 'New file...',
      action: 'newfile',
      menuLink: '',
      icon: 'file',
      type: 'far',
      isActive: true,
    },
    {
      menuText: 'New Folder...',
      action: 'newfolder',
      menuLink: '',
      icon: 'folder',
      type: 'far',
      isActive: true,
    },
  ];
  arrUpload: Array<MenuItem> = [
    {
      menuText: 'Upload File...',
      action: 'uploadfile',
      menuLink: '',
      icon: 'file-lines',
      type: 'far',
      isActive: true,
    },
    {
      menuText: 'Upload Folder...',
      action: 'uploadfolder',
      menuLink: '',
      icon: 'folder',
      type: 'far',
      isActive: true,
    },
    {
      menuText: 'Upload Zip...',
      action: 'uploadfolder',
      menuLink: '',
      icon: 'file-zipper',
      type: 'far',
      isActive: true,
    },
  ];
  arrHistoryBreadcrumb: any = [];
  arrBackForward: any = [];
  public breadcrumb: any;
  arrFolderFile: Array<FileFolder> = [];
  rightClickMenuItems: Array<MenuItem> = [];
  parentElem: any;
  contextMenuSelector: string;
  menuEvent: any;
  isOpenUpload: boolean = false;
  isOpenInfo: boolean = false;
  isOpenFileFolder: Boolean = false;
  private currentUser: any;
  private ff: any;
  childFolder: boolean = false;
  isCut: boolean = false;
  isCopy: boolean = false;
  cutItem: any;
  copyItem: any;
  loading: boolean = false;
  systemVars: any;
  host: string;
  username: string;
  isOpenHis: boolean = false;
  private beforeInitialDirectory: any;
  itemTargetMulti: any = [];
  itemTargetMultiDelete: any = [];
  itemTargetMultiCHMOD: any = [];
  @ViewChild('contextMenu', { read: ViewContainerRef, static: true })
  container: any;
  private wasInside: Boolean = false;
  sortType: boolean = true;
  indexBF: number = 0;
  sortTypeStr: string = 'name';
  actionMenu: FileFolder;
  isPaste: boolean = false;
  file: any;
  folder: any;
  zip: any;
  countChoosen: number = 0;
  selectedFile: any;
  downloadLink: any;
  arrEditorFile: any = [];
  @Input() refresh: boolean = true;
  @Output() arrBackForwardChange: EventEmitter<any> = new EventEmitter();
  @Input() backForward: any;
  @Input() actionBF: any;
  @Input() action: any;
  constructor(
    private modalService: NgbModal,
    private componentFactoryResolver: ComponentFactoryResolver,
    private authService: AuthService,
    private _sanitizer: DomSanitizer,
    private _eref: ElementRef
  ) {}
  ngOnInit(): void {
    this.breadcrumb = {
      links: [
        {
          id: 0,
          name: 'Home',
          link: '',
          icon: 'house-chimney',
          typeIcon: 'fas',
          isHere: true,
        },
      ],
    };
    this.authService.configuration.subscribe((res: any) => {
      if (res.actionName) {
        this.currentUser = res;
        this.host = this.currentUser.configuration.host;
        this.username = this.currentUser.configuration.username;
        this.arrBackForward.push({
          id: 1,
          name: '/',
          value: '/',
          breadcrumb: [
            {
              id: 0,
              name: 'Home',
              link: '',
              icon: 'house-chimney',
              typeIcon: 'fas',
              isHere: true,
            },
          ],
        });
        this.indexBF = 0;
        this.backForward = {
          arrBackForward: this.arrBackForward,
          indexBF: this.indexBF,
        };
        this.arrBackForwardChange.emit(this.backForward);

        this.arrHistoryBreadcrumb.push({
          id: 0,
          name: '/',
          value: '/',
          breadcrumb: [
            {
              id: 0,
              name: 'Home',
              link: '',
              icon: 'house-chimney',
              typeIcon: 'fas',
              isHere: true,
            },
          ],
        });
        this.initGetData(this.currentUser);
      }
    });
    this.authService.systemVars.subscribe((res: any) => {
      if (res.version) {
        this.systemVars = res;
      }
    });
  }
  onClickedOutside() {
    this.isOpenHis = false;
    this.footerItem.isOpen = false;
  }
  onClickedOutsideBreadCrumb() {
    this.isOpenHis = false;
  }
  clickBackForward(action: string) {
    if (action == 'back') {
      if (this.indexBF == 0) return;
      this.indexBF = this.indexBF - 1;
    } else {
      if (this.indexBF == this.arrBackForward.length - 1) return;
      this.indexBF = this.indexBF + 1;
    }
    for (let i of this.arrBackForward) {
      i.isHere = false;
      if (i.id == this.indexBF + 1) {
        i.isHere = true;
        this.currentUser.context.path = i.name;
        this.currentUser.configuration.initialDirectory = i.name;
        this.breadcrumb.links = i.breadcrumb;
        this.initGetData(this.currentUser);
      }
    }
    this.backForward = {
      arrBackForward: this.arrBackForward,
      indexBF: this.indexBF,
    };
    this.arrBackForwardChange.emit(this.backForward);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.refresh && changes.refresh.currentValue) {
      this.initGetData(this.currentUser);
    }
    if (changes.actionBF && changes.actionBF.currentValue) {
      this.clickBackForward(changes.actionBF.currentValue.action);
    }
  }

  async initGetData(formdata: any) {
    this.loading = true;
    let data = new FormData();
    data.append('request', JSON.stringify(formdata));
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
      const arrFolderFile = result.data;
      if (this.currentUser.configuration.initialDirectory != '/') {
        this.childFolder = true;
      } else {
        this.childFolder = false;
      }
      let index = 0;
      for (let i of arrFolderFile) {
        i.id = index;
        index++;
        i.dayStr = new Date(i.modificationDate * 1000);
        let date = new Date(i.modificationDate * 1000);
        let dateModification = date.setHours(0, 0, 0, 0);
        let today = new Date();
        if (dateModification == today.setHours(0, 0, 0, 0)) {
          i.checkDate = true;
        }
        i.prefix = this.normalizeFileSize(i.size);
        i.permissions = this.checkPerMission(i);
        i.type = this.checkIcon(i).type;
        i.icon = this.checkIcon(i).icon;
        i.isActive = false;
      }
      this.checkSort('name', this.sortType, arrFolderFile);
      this.activeFooterMenu(this.footerMenuItems, false);
      this.loading = false;
      this.countChoosen = 0;
      // this.openInfo();
    }
  }

  //sort
  sort(type: string, arr: any) {
    this.sortType = !this.sortType;
    this.sortTypeStr = type;
    switch (type) {
      case 'name':
        this.checkSort(type, this.sortType, arr);
        break;
      case 'size':
        this.checkSort(type, this.sortType, arr);
        break;
      case 'date':
        this.checkSort(type, this.sortType, arr);
        break;
    }
  }
  checkSort(type: string, sortType: boolean, arr: any) {
    let arrSortFolder = [];
    let arrSortFile = [];
    for (let i of arr) {
      i.nameS = i.name.toLowerCase();
      if (i.isDirectory) {
        arrSortFolder.push(i);
      } else {
        arrSortFile.push(i);
      }
    }
    if (sortType) {
      switch (type) {
        case 'name':
          arrSortFolder.sort((a: any, b: any) => {
            return a.nameS < b.nameS ? -1 : Number(a.nameS > b.nameS);
          });
          arrSortFile.sort((a: any, b: any) => {
            return a.nameS < b.nameS ? -1 : Number(a.nameS > b.nameS);
          });
          break;
        case 'size':
          arrSortFolder.sort((a: any, b: any) => {
            return a.size < b.size ? -1 : Number(a.size > b.size);
          });
          arrSortFile.sort((a: any, b: any) => {
            return a.size < b.size ? -1 : Number(a.size > b.size);
          });
          break;
        case 'date':
          arrSortFolder.sort((a: any, b: any) => {
            return a.dateModification * 1000 - b.dateModification * 1000;
          });
          arrSortFile.sort((a: any, b: any) => {
            return a.dateModification * 1000 - b.dateModification * 1000;
          });
          break;
      }
      this.arrFolderFile = arrSortFolder.concat(arrSortFile);
    } else {
      switch (type) {
        case 'name':
          arrSortFolder.sort((a: any, b: any) => {
            return a.nameS > b.nameS ? -1 : Number(a.nameS < b.nameS);
          });
          arrSortFile.sort((a: any, b: any) => {
            return a.nameS > b.nameS ? -1 : Number(a.nameS < b.nameS);
          });
          break;
        case 'size':
          arrSortFolder.sort((a: any, b: any) => {
            return a.size > b.size ? -1 : Number(a.size < b.size);
          });
          arrSortFile.sort((a: any, b: any) => {
            return a.size > b.size ? -1 : Number(a.size < b.size);
          });
          break;
        case 'date':
          arrSortFolder.sort((a: any, b: any) => {
            return b.dateModification * 1000 - a.dateModification * 1000;
          });
          arrSortFile.sort((a: any, b: any) => {
            return b.dateModification * 1000 - a.dateModification * 1000;
          });
          break;
      }
      this.arrFolderFile = arrSortFile.concat(arrSortFolder);
    }
  }
  //End sort

  // permission
  checkPerMission(t: any) {
    var n = t.isDirectory ? 'd' : '-',
      o = this.numericToObject(t.numericPermissions);
    return (
      (n += o.ownerRead ? 'r' : '-'),
      (n += o.ownerWrite ? 'w' : '-'),
      (n += o.ownerExecute ? 'x' : '-'),
      (n += o.groupRead ? 'r' : '-'),
      (n += o.groupWrite ? 'w' : '-'),
      (n += o.groupExecute ? 'x' : '-'),
      (n += o.otherRead ? 'r' : '-'),
      (n += o.otherWrite ? 'w' : '-'),
      (n += o.otherExecute ? 'x' : '-')
    );
  }

  objectToNumeric(e: any) {
    return (
      (e.ownerRead ? 256 : 0) +
      (e.ownerWrite ? 128 : 0) +
      (e.ownerExecute ? 64 : 0) +
      (e.groupRead ? 32 : 0) +
      (e.groupWrite ? 16 : 0) +
      (e.groupExecute ? 8 : 0) +
      (e.otherRead ? 4 : 0) +
      (e.otherWrite ? 2 : 0) +
      (e.otherExecute ? 1 : 0)
    );
  }
  numericToObject(e: any) {
    return {
      ownerRead: 0 != (256 & e),
      ownerWrite: 0 != (128 & e),
      ownerExecute: 0 != (64 & e),
      groupRead: 0 != (32 & e),
      groupWrite: 0 != (16 & e),
      groupExecute: 0 != (8 & e),
      otherRead: 0 != (4 & e),
      otherWrite: 0 != (2 & e),
      otherExecute: 0 != (1 & e),
    };
  }
  //end Permission

  // Prefix
  normalizeFileSize(e: number) {
    if ('number' != typeof e) return '';
    for (
      var t = 'B',
        n: any = e,
        o: any = [
          [1099511627776, 'TB'],
          [1073741824, 'GB'],
          [1048576, 'MB'],
          [1024, 'KB'],
        ],
        i = 0;
      i < o.length;
      ++i
    )
      if (e >= o[i][0]) {
        (n = (n = e / o[i][0]).toFixed(1)), (t = o[i][1]);
        break;
      }
    return 'KB' == t && (n = Math.round(n)), n + t;
  }
  // End Prefix

  // Check Icon Folder File
  checkIcon(e: any) {
    if (e.isDirectory) return { icon: 'folder', type: 'fas' };
    if (e.isLink) return { icon: 'right-long', type: 'far' };
    var t = '';
    switch (this.extractFileExtension(e.name)) {
      case 'doc':
      case 'docx':
        t = 'word';
        break;
      case 'xlr':
      case 'xls':
      case 'xlsx':
        t = 'excel';
        break;
      case 'ppt':
      case 'pps':
      case 'pptx':
        t = 'powerpoint';
        break;
      case 'pdf':
        t = 'pdf';
        break;
      case 'txt':
      case 'rtf':
      case 'text':
        t = 'text';
        break;
      case 'bmp':
      case 'gif':
      case 'jpg':
      case 'png':
      case 'psd':
      case 'tif':
      case 'ai':
      case 'eps':
      case 'svg':
      case 'ps':
      case 'jpeg':
        t = 'image';
        break;
      case 'avi':
      case 'flv':
      case 'm4v':
      case 'mov':
      case 'mp4':
      case 'mkv':
      case 'mpg':
      case 'wmv':
        t = 'video';
        break;
      case 'wav':
      case 'mp3':
      case 'wma':
      case 'm4a':
      case 'm4p':
      case 'mpa':
      case 'flac':
      case 'aif':
      case 'aiff':
        t = 'audio';
        break;
      case 'tar':
      case 'zip':
      case 'tgz':
      case 'gz':
      case 'gzip':
      case 'rar':
        t = 'archive';
        break;
      case 'htm':
      case 'html':
      case 'php':
      case 'asp':
      case 'aspx':
      case 'js':
      case 'css':
      case 'xhtml':
      case 'cfm':
      case 'pl':
      case 'py':
      case 'c':
      case 'cpp':
      case 'rb':
      case 'java':
      case 'xml':
      case 'json':
        t = 'code';
    }
    return { icon: 'file' + ('' == t ? '' : '-') + t, type: 'far' };
  }

  extractFileExtension(e: string) {
    if ('string' != typeof e) return '';
    var t = e.split('.');
    return 1 == t.length || (2 == t.length && '' == t[0])
      ? ''
      : t[t.length - 1].toLowerCase();
  }
  // End Check Icon Folder File
  down: boolean = false;
  mousedown(e: any, ff: any, i: any) {
    if (e.which != 3) {
      this.down = true;
      this.onClickedOutside();
      if (e.ctrlKey) this.usingCtrKey = true;
      else this.usingCtrKey = false;
      if (e.shiftKey) {
        ff.index = i;
        for (let j of this.arrFolderFile) {
          j.isActive = false;
        }
        if (this.ff.index < ff.index) {
          for (let e = this.ff.index; e <= ff.index; e++) {
            this.arrFolderFile[e].isActive = true;
          }
        } else {
          for (let e = ff.index; e <= this.ff.index; e++) {
            this.arrFolderFile[e].isActive = true;
          }
        }
      } else if (e.ctrlKey) {
        if (ff.isActive) {
          ff.isActive = false;
        } else {
          ff.isActive = true;
        }
      } else {
        let count = 0;
        for (let j of this.arrFolderFile) {
          if (j.isActive) {
            count++;
          }
        }
        if (count <= 1) {
          if (ff.isActive) {
            for (let j of this.arrFolderFile) {
              j.isActive = false;
            }
            this.ff = {
              checkDate: true,
              dayStr: '',
              icon: 'file',
              isActive: false,
              isDirectory: true,
              isLink: false,
              linkCount: 0,
              modificationDate: 0,
              name: '',
              nameS: '',
              numericPermissions: 0,
              ownerGroupName: '',
              ownerUserName: '',
              permissions: '',
              prefix: '0',
              size: 0,
              type: 'fas',
            };
            this.activeFooterMenu(this.footerMenuItems, ff.isActive);
          } else {
            for (let j of this.arrFolderFile) {
              j.isActive = false;
            }
            ff.isActive = true;
            ff.index = i;
            this.activeFooterMenu(this.footerMenuItems, ff.isActive);
            this.ff = ff;
          }
        } else {
          for (let j of this.arrFolderFile) {
            j.isActive = false;
          }
          ff.isActive = true;
          ff.index = i;
          this.activeFooterMenu(this.footerMenuItems, ff.isActive);
          this.ff = ff;
        }
      }
    }
  }

  mouseover(ff: any) {
    if (this.down) {
      ff.isActive = true;
    }
  }

  mouseup() {
    this.down = false;
    let countAll = 0;
    for (let j of this.arrFolderFile) {
      if (j.isActive) {
        countAll++;
      }
    }
    this.countChoosen = countAll;
    if (countAll > 0) {
      this.activeFooterMenu(this.footerMenuItems, true);
    } else {
      this.activeFooterMenu(this.footerMenuItems, false);
    }
  }
  usingCtrKey = false;
  clickItem(e: any, ff: any, i: any) {
    this.onClickedOutside();
    if (e.ctrlKey) this.usingCtrKey = true;
    else this.usingCtrKey = false;
    if (e.shiftKey) {
      //ok
      ff.index = i;
      for (let j of this.arrFolderFile) {
        j.isActive = false;
      }
      if (this.ff.index < ff.index) {
        for (let e = this.ff.index; e <= ff.index; e++) {
          this.arrFolderFile[e].isActive = true;
        }
      } else {
        for (let e = ff.index; e <= this.ff.index; e++) {
          this.arrFolderFile[e].isActive = true;
        }
      }
    } else if (e.ctrlKey) {
      if (ff.isActive) {
        ff.isActive = false;
      } else {
        ff.isActive = true;
      }
    } else {
      let count = 0;
      for (let j of this.arrFolderFile) {
        if (j.isActive) {
          count++;
        }
      }
      if (count <= 1) {
        if (ff.isActive) {
          for (let j of this.arrFolderFile) {
            j.isActive = false;
          }
          this.ff = {
            checkDate: true,
            dayStr: '',
            icon: 'file',
            isActive: false,
            isDirectory: true,
            isLink: false,
            linkCount: 0,
            modificationDate: 0,
            name: '',
            nameS: '',
            numericPermissions: 0,
            ownerGroupName: '',
            ownerUserName: '',
            permissions: '',
            prefix: '0',
            size: 0,
            type: 'fas',
          };
          this.activeFooterMenu(this.footerMenuItems, ff.isActive);
        } else {
          for (let j of this.arrFolderFile) {
            j.isActive = false;
          }
          ff.isActive = true;
          ff.index = i;
          this.activeFooterMenu(this.footerMenuItems, ff.isActive);
          this.ff = ff;
        }
      } else {
        for (let j of this.arrFolderFile) {
          j.isActive = false;
        }
        ff.isActive = true;
        ff.index = i;
        this.activeFooterMenu(this.footerMenuItems, ff.isActive);
        this.ff = ff;
      }
    }
    let countAll = 0;
    for (let j of this.arrFolderFile) {
      if (j.isActive) {
        countAll++;
      }
    }
    this.countChoosen = countAll;
    if (countAll > 0) {
      this.activeFooterMenu(this.footerMenuItems, true);
    } else {
      this.activeFooterMenu(this.footerMenuItems, false);
    }
  }

  clickGoToRoute(link: any) {
    if (!link.isHere) {
      if (link.link == '') {
        this.currentUser.context.path = '/';
        this.currentUser.configuration.initialDirectory = '/';
      } else {
        this.currentUser.context.path = link.link;
        this.currentUser.configuration.initialDirectory = link.link;
      }
      this.initGetData(this.currentUser);
      for (let i of this.breadcrumb.links) {
        i.isHere = false;
        if (i.id == link.id) {
          i.isHere = true;
          let length = this.breadcrumb.links.length;
          this.breadcrumb.links.splice(
            this.breadcrumb.links.indexOf(i) + 1,
            length - (i.id + 1)
          );
        }
      }
      let arr = [];
      for (let i of this.breadcrumb.links) {
        arr.push(i);
      }
      let lengthBF = this.arrBackForward.length;
      const dataBF = {
        id: lengthBF + 1,
        name: link.link == '' ? '/' : link.link,
        value: link.link == '' ? '/' : link.link,
        breadcrumb: arr,
      };
      this.arrHistoryBreadcrumb.push(dataBF);
      this.arrBackForward.push(dataBF);
      this.backForward = {
        arrBackForward: this.arrBackForward,
        indexBF: this.indexBF,
      };
      this.arrBackForwardChange.emit(this.backForward);
      this.checkBackForward(this.arrBackForward);
    }
  }

  activeFooterMenu(arr: any, isTarget: boolean) {
    if (!isTarget) {
      for (let i of arr) {
        if (
          i.action == 'download' ||
          i.action == 'cut' ||
          i.action == 'copy' ||
          i.action == 'delete' ||
          i.action == 'chmod' ||
          i.action == 'showeditor'
        ) {
          i.isActive = true;
          i.isDisabled = false;
        }
      }
    } else {
      for (let i of arr) {
        if (
          i.action == 'download' ||
          i.action == 'cut' ||
          i.action == 'copy' ||
          i.action == 'delete' ||
          i.action == 'chmod' ||
          i.action == 'showeditor'
        ) {
          i.isActive = false;
          i.isDisabled = false;
        }
      }
    }
  }

  clickBack() {
    this.loading = true;
    for (let i of this.breadcrumb.links) {
      if (i.isHere) {
        this.breadcrumb.links.splice(this.breadcrumb.links.indexOf(i), 1);
      }
    }
    const length = this.breadcrumb.links.length;
    this.breadcrumb.links[length - 1].isHere = true;
    const route = this.breadcrumb.links[length - 1].link;
    if (route == '') {
      this.currentUser.context.path = '/';
      this.currentUser.configuration.initialDirectory = '/';
    } else {
      this.currentUser.context.path = route;
      this.currentUser.configuration.initialDirectory = route;
    }
    let arr = [];
    for (let i of this.breadcrumb.links) {
      arr.push(i);
    }
    let lengthBF = this.arrBackForward.length;
    const dataBF = {
      id: lengthBF + 1,
      name: route == '' ? '/' : route,
      value: route == '' ? '/' : route,
      breadcrumb: arr,
    };
    this.arrBackForward.push(dataBF);
    this.checkBackForward(this.arrBackForward);
    this.backForward = {
      arrBackForward: this.arrBackForward,
      indexBF: this.indexBF,
    };
    this.arrBackForwardChange.emit(this.backForward);

    this.initGetData(this.currentUser);
  }

  async goTo(ff: any, arrBreadcumb: any) {
    if (ff.isDirectory) {
      this.loading = true;
      this.breadcrumb.links.push({
        id: this.breadcrumb.links.length,
        name: ff.name,
        link: '',
        icon: '',
        typeIcon: '',
        isHere: true,
      });
      for (let i of this.breadcrumb.links) {
        i.isHere = false;
      }
      const length = this.breadcrumb.links.length;
      this.breadcrumb.links[length - 1].isHere = true;
      this.breadcrumb.links[length - 1].link =
        this.breadcrumb.links[length - 2].link + '/' + ff.name;
      this.currentUser.context.path = this.breadcrumb.links[length - 1].link;
      this.currentUser.configuration.initialDirectory =
        this.breadcrumb.links[length - 1].link;
      for (let i of this.arrHistoryBreadcrumb) {
        if (i.name == arrBreadcumb[length - 1].link) {
          this.initGetData(this.currentUser);
          return;
        }
      }
      let lengthHistory = this.arrHistoryBreadcrumb.length;
      let arr = [];
      for (let i of arrBreadcumb) {
        arr.push(i);
      }
      const data = {
        id: lengthHistory,
        name: arrBreadcumb[length - 1].link,
        value: arrBreadcumb[length - 1].link,
        breadcrumb: arr,
      };
      this.arrHistoryBreadcrumb.push(data);

      let lengthBF = this.arrBackForward.length;
      const dataBF = {
        id: lengthBF + 1,
        name: arrBreadcumb[length - 1].link,
        value: arrBreadcumb[length - 1].link,
        breadcrumb: arr,
      };
      this.arrBackForward.push(dataBF);
      this.checkBackForward(this.arrBackForward);
      this.backForward = {
        arrBackForward: this.arrBackForward,
        indexBF: this.indexBF,
      };
      this.arrBackForwardChange.emit(this.backForward);

      this.initGetData(this.currentUser);
    }
  }

  checkBackForward(arr: any) {
    for (let i of arr) {
      i.isHere = false;
    }
    arr[arr.length - 1].isHere = true;
    this.indexBF = this.arrBackForward.length - 1;
  }

  openHistory() {
    this.isOpenHis = !this.isOpenHis;
  }

  goToHis(his: any) {
    this.currentUser.context.path = '';
    this.currentUser.configuration.initialDirectory = '';
    this.currentUser.context.path = his.name;
    this.currentUser.configuration.initialDirectory = his.name;
    this.initGetData(this.currentUser);
    this.breadcrumb.links = his.breadcrumb;
    let lengthBF = this.arrBackForward.length;
    const dataBF = {
      id: lengthBF + 1,
      name: his.name,
      value: his.value,
      breadcrumb: his.breadcrumb,
    };
    this.arrBackForward.push(dataBF);
    this.checkBackForward(this.arrBackForward);
    this.isOpenHis = false;

    this.backForward = {
      arrBackForward: this.arrBackForward,
      indexBF: this.indexBF,
    };
    this.arrBackForwardChange.emit(this.backForward);
  }
  index: number = -1;
  openMenuItem(event: any, ff: any, i: number) {
    this.onClickedOutside();
    this.menuEvent = event;
    this.contextMenuSelector = event.srcElement;
    this.actionMenu = ff;
    this.index = i;
    const arrChoosenIndex = [];
    if (ff == null) {
      this.rightClickMenuItems = [
        {
          menuText: 'New file...',
          action: 'newfile',
          menuLink: '',
          icon: 'file',
          type: 'far',
          isActive: true,
        },
        {
          menuText: 'New Folder...',
          action: 'newfolder',
          menuLink: '',
          icon: 'folder',
          type: 'far',
          isActive: true,
        },
        {
          menuText: 'Paste',
          action: 'paste',
          menuLink: '',
          icon: 'paste',
          type: 'far',
          isActive: false,
        },
      ];
      if (this.isPaste) {
        this.rightClickMenuItems[2].isActive = true;
      }
    } else {
      for (let i in this.arrFolderFile) {
        if (this.arrFolderFile[i].isActive) {
          arrChoosenIndex.push(Number(i));
        }
      }
      if (arrChoosenIndex.indexOf(this.index) < 0) {
        this.countChoosen = 1;
        for (let i in this.arrFolderFile) {
          this.arrFolderFile[i].isActive = false;
        }
        this.arrFolderFile[this.index].isActive = true;
      }

      if (this.countChoosen < 2) {
        // có 2 loại popup
        if (ff != null) {
          this.rightClickMenuItems = [
            {
              menuText: 'Open',
              action: 'open',
              menuLink: '',
              icon: 'folder-open',
              type: 'far',
              isActive: true,
            },
            {
              menuText: 'Download',
              action: 'download',
              menuLink: '',
              icon: 'download',
              type: 'fas',
              isActive: true,
            },
            {
              menuText: 'Copy Name',
              action: 'copyname',
              menuLink: '',
              icon: 'paste',
              type: 'fas',
              isActive: true,
            },
            {
              menuText: 'Create Zip Archive',
              action: 'zip',
              menuLink: '',
              icon: 'file-zipper',
              type: 'fas',
              isActive: true,
            },
            {
              menuText: 'Cut',
              action: 'cut',
              menuLink: '',
              icon: 'scissors',
              type: 'fas',
              isActive: true,
            },
            {
              menuText: 'Copy',
              action: 'copy',
              menuLink: '',
              icon: 'copy',
              type: 'fas',
              isActive: true,
            },
            {
              menuText: 'Rename...',
              action: 'rename',
              menuLink: '',
              icon: 'i-cursor',
              type: 'fas',
              isActive: true,
            },
            {
              menuText: 'Delete...',
              action: 'delete',
              menuLink: '',
              icon: 'trash-can',
              type: 'fas',
              isActive: true,
            },
            {
              menuText: 'CHMOD',
              action: 'chmod',
              menuLink: '',
              icon: 'key',
              type: 'fas',
              isActive: true,
            },
            {
              menuText: 'Properties',
              action: 'properties',
              menuLink: '',
              icon: 'circle-info',
              type: 'fas',
              isActive: true,
            },
          ];

          if (!ff.isDirectory) {
            if (ff.icon == 'file-archive') {
              this.rightClickMenuItems[0] = {
                menuText: 'Extract',
                action: 'extract',
                menuLink: '',
                icon: 'share-from-square',
                type: 'fas',
                isActive: true,
              };
            } else {
              this.rightClickMenuItems[0] = {
                menuText: 'Edit',
                action: 'edit',
                menuLink: '',
                icon: 'pen-to-square',
                type: 'fas',
                isActive: true,
              };
            }
          }
        }
      } else {
        this.rightClickMenuItems = [
          {
            menuText: 'Download',
            action: 'download',
            menuLink: '',
            icon: 'download',
            type: 'fas',
            isActive: true,
          },

          {
            menuText: 'Cut',
            action: 'cut',
            menuLink: '',
            icon: 'scissors',
            type: 'fas',
            isActive: true,
          },
          {
            menuText: 'Copy',
            action: 'copy',
            menuLink: '',
            icon: 'copy',
            type: 'fas',
            isActive: true,
          },
          {
            menuText: 'Delete...',
            action: 'delete',
            menuLink: '',
            icon: 'trash-can',
            type: 'fas',
            isActive: true,
          },
          {
            menuText: 'CHMOD',
            action: 'chmod',
            menuLink: '',
            icon: 'key',
            type: 'fas',
            isActive: true,
          },
        ];
      }

      if (!this.systemVars.applicationSettings.disableCreateZipArchive) {
        this.rightClickMenuItems.push({
          menuText: 'Create Zip Archive',
          action: 'zip',
          menuLink: '',
          icon: 'file-zipper',
          type: 'fas',
          isActive: true,
        });
      }
    }
    this.createContextMenuComponent();
  }

  createContextMenuComponent() {
    this.container.clear();
    const componentFactory =
      this.componentFactoryResolver.resolveComponentFactory(
        ContextMenuComponent
      );
    const componentRef = this.container.createComponent(componentFactory);
    (<ContextMenuComponent>componentRef.instance).contextMenuEvent =
      this.menuEvent;
    (<ContextMenuComponent>componentRef.instance).contextMenuSelector =
      this.contextMenuSelector;
    (<ContextMenuComponent>componentRef.instance).contextMenuItems =
      this.rightClickMenuItems;
    (<ContextMenuComponent>componentRef.instance).actionMenu = this.actionMenu;
    (<ContextMenuComponent>componentRef.instance).currentUser =
      this.currentUser;
    (<ContextMenuComponent>componentRef.instance).arrFolderFile =
      this.arrFolderFile;
    (<ContextMenuComponent>componentRef.instance).index = this.index;
    componentRef.instance.changeAction.subscribe((data: any) => {
      if (data.status) {
        if (data.isEdit) {
          let item = this.footerMenuItems[4];
          item.isActive = false;
          this.ff = this.actionMenu;
          this.onClickMenuItem(item);
        } else if (data.isOpen) {
          this.goTo(this.actionMenu, this.breadcrumb.links);
        } else if (data.isPaste) {
          const item = this.footerMenuItems[7];
          this.ff = this.actionMenu;
          this.onClickMenuItem(item);
        } else if (data.isCut) {
          const item = this.footerMenuItems[5];
          this.ff = this.actionMenu;
          this.onClickMenuItem(item);
        } else if (data.isCopy) {
          const item = this.footerMenuItems[6];
          this.ff = this.actionMenu;
          this.onClickMenuItem(item);
        } else if (data.isDelete) {
          const item = this.footerMenuItems[8];
          item.isActive = false;
          this.ff = this.actionMenu;
          this.onClickMenuItem(item);
        } else if (data.isDownLoad) {
          const item = this.footerMenuItems[1];
          item.isActive = false;
          this.ff = this.actionMenu;
          this.onClickMenuItem(item);
        } else if (data.isCHMOD) {
          const item = this.footerMenuItems[9];
          item.isActive = false;
          this.ff = this.actionMenu;
          this.onClickMenuItem(item);
        } else {
          this.loading = true;
          this.initGetData(this.currentUser);
          this.activeFooterMenu(this.footerMenuItems, false);
        }
      }
    });
  }

  openPermission(ff: any, arr: any) {
    let modalRef = this.modalService.open(ChmodDialogComponent, {
      windowClass: 'animated fadeInDown',
      size: 'md',
    });
    modalRef.componentInstance.item = ff;
    modalRef.componentInstance.arr = arr;
    modalRef.result.then(async (res: any) => {
      if (res.status) {
        if (res.arr.length == 0) {
          const route = this.currentUser.context.path;
          const context = {
            remotePath: route == '/' ? '/' + ff.name : route + '/' + ff.name,
            mode: res.mode,
          };
          const data = this.configuration('changePermissions', context);
          this.loading = true;
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
            this.initGetData(this.currentUser);
            this.activeFooterMenu(this.footerMenuItems, false);
            this.itemTargetMultiCHMOD = [];
          }
        } else {
          let count = 0;
          for (let i of res.arr) {
            const route = this.currentUser.context.path;
            const context = {
              remotePath: route == '/' ? '/' + i.name : route + '/' + i.name,
              mode: res.mode,
            };
            const data = this.configuration('changePermissions', context);
            this.loading = true;
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
              count++;
            }
          }
          if (count == res.arr.length) {
            this.initGetData(this.currentUser);
            this.activeFooterMenu(this.footerMenuItems, false);
            this.itemTargetMultiCHMOD = [];
          }
        }
      }
    });
  }

  openProperties(ff: any) {
    let modalRef = this.modalService.open(PropertiesDialogComponent, {
      windowClass: 'animated fadeInDown',
      size: 'md',
    });
    modalRef.componentInstance.properties = ff;
  }

  previewFile(event: any) {
    var files = event.target.files || event.dataTransfer.files;
    if (files.length !== 0) {
      this.selectedFile = [];
      this.selectedFile.push(files);
    }
    this.createPreview(this.selectedFile, 'file', false);
  }

  previewFolder(event: any) {
    var folder = event.target.files || event.dataTransfer.files;
    if (folder.length !== 0) {
      this.selectedFile = [];
      this.selectedFile.push(folder);
    }
    this.createPreview(this.selectedFile, 'folder', false);
  }

  previewZip(event: any) {
    var zip = event.target.files || event.dataTransfer.files;

    let modalRef = this.modalService.open(ArchiveDialogComponent, {
      windowClass: 'animated fadeInDown',
      size: 'md',
    });
    modalRef.componentInstance.name = zip[0].name;
    modalRef.result.then((res: any) => {
      if (res.status) {
        if (zip.length !== 0) {
          this.selectedFile = [];
          this.selectedFile.push(zip);
        }
        this.createPreview(this.selectedFile, 'zip', res.zip);
      }
    });
  }
  random(e: number) {
    for (
      var t = '',
        n = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      t.length < e;

    )
      t += n.charAt(Math.floor(Math.random() * n.length));
    return t;
  }
  async createPreview(files: any, type: string, zip: boolean) {
    let totalFileSize = 0;
    for (let i of files[0]) {
      totalFileSize += i.size;
      i.typeFile = this.checkIcon(i).icon;
      i.sizeStr = this.normalizeFileSize(i.size);
    }
    let modalUploadRef = this.modalService.open(UploadDialogComponent, {
      windowClass: 'animated fadeInDown',
      size: 'md',
    });
    modalUploadRef.componentInstance.files = files[0];
    modalUploadRef.componentInstance.user = this.currentUser;
    modalUploadRef.componentInstance.totalFileSize = totalFileSize;
    modalUploadRef.componentInstance.totalFileSizeStr =
      this.normalizeFileSize(totalFileSize);
    modalUploadRef.componentInstance.type = type;
    modalUploadRef.componentInstance.zip = zip;
    modalUploadRef.componentInstance.uploadChunk =
      this.systemVars.disableChunkUploadSize;
    modalUploadRef.result.then(async (res: any) => {
      if (res.status) {
        this.file = null;
        this.initGetData(this.currentUser);
        this.activeFooterMenu(this.footerMenuItems, false);
        this.footerItem.isOpen = false;
      }
    });
  }

  openUpload() {
    // this.footerItem.isOpen = false;
  }

  openDialogFooterItem(item: any) {
    if (item.action == 'newfile' || item.action == 'newfolder') {
      item.isOpen = false;
      this.footerItem.isOpen = false;
      let modalRef = this.modalService.open(NewDialogComponent, {
        windowClass: 'animated fadeInDown',
        size: 'md',
      });
      modalRef.componentInstance.action = item.action;
      modalRef.result.then(async (res: any) => {
        if (res.status) {
          this.loading = true;
          if (item.action == 'newfolder') {
            const context = {
              remotePath: this.currentUser.context.path + '/' + res.name,
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
              this.initGetData(this.currentUser);
              this.activeFooterMenu(this.footerMenuItems, false);
            }
          } else {
            const context = {
              remotePath: this.currentUser.context.path + '/' + res.name,
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
              this.initGetData(this.currentUser);
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
                  this.arrEditorFile = ress.arrHistory;
                  // this.initEditorFile(res.name, this.arrEditorFile);
                  this.initGetData(this.currentUser);
                }
              });
            }
          }
        }
      });
    }
  }

  b64DecodeUnicode(e: any) {
    return decodeURIComponent(
      Array.prototype.map
        .call(atob(e), function (e) {
          return '%' + ('00' + e.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
  }

  //Footer

  async onClickMenuItem(item: MenuFooterItem): Promise<void> {
    const route = this.currentUser.configuration.initialDirectory;
    switch (item.action) {
      case 'upload':
      case 'newfilefolder': {
        for (let i of this.footerMenuItems) {
          if (i.isOpen != item.isOpen) {
            i.isOpen = false;
          }
        }
        item.isOpen = !item.isOpen;
        this.footerItem = item;
        break;
      }
      case 'download': {
        this.loading = true;
        if (!item.isActive) {
          const context = { remotePath: '/' + this.ff.name };
          const data = this.configuration('fetchFile', context);
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
            setTimeout(() => {
              var n = result.fileKey;
              this.downloadLink =
                this._sanitizer.bypassSecurityTrustResourceUrl(
                  environment.apiUrl +
                    `/application/api/download.php?fileKey=${n}`
                );
              this.loading = false;
              // this.downloadLink.target = '_blank';
              // this.downloadLink.click();
            }, 1000);
          }
        }
        break;
      }
      case 'delete': {
        this.itemTargetMultiDelete = [];
        for (let i of this.arrFolderFile) {
          if (i.isActive) {
            this.itemTargetMultiDelete.push(i);
          }
        }
        if (!item.isActive) {
          let modalRef = this.modalService.open(WarningDialogComponent, {
            windowClass: 'animated fadeInDown',
            size: 'md',
          });
          modalRef.componentInstance.text =
            'Are you sure you want to delete ' +
            this.itemTargetMultiDelete.length +
            ' item?';
          modalRef.result.then(async (res: any) => {
            if (res) {
              let arrPathAndType = [];
              for (let i of this.itemTargetMultiDelete) {
                arrPathAndType.push([
                  route == '/' ? '/' + i.name : route + '/' + i.name,
                  i.isDirectory,
                ]);
              }
              const context = {
                pathsAndTypes: arrPathAndType,
              };
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
                this.initGetData(this.currentUser);
                this.activeFooterMenu(this.footerMenuItems, false);
                if (this.itemTargetMultiDelete.length == 1) {
                  const directory =
                    this.currentUser.configuration.initialDirectory;
                  for (let i of this.arrEditorFile) {
                    if (
                      i.initialDirectory == directory &&
                      i.name == this.ff.name
                    ) {
                      this.arrEditorFile.splice(
                        this.arrEditorFile.indexOf(i),
                        1
                      );
                    }
                  }
                } else {
                  const directory =
                    this.currentUser.configuration.initialDirectory;
                  for (let i of this.itemTargetMultiDelete) {
                    const fileName =
                      directory == '/'
                        ? '/' + i.name
                        : directory + '/' + i.name;
                    let dupArr = this.arrEditorFile.filter(
                      (x: any) => x.fileName === fileName
                    );
                    if (dupArr.length > 0) {
                      this.arrEditorFile.splice(
                        this.arrEditorFile.indexOf(dupArr[0])
                      );
                    }
                  }
                }
                this.itemTargetMultiDelete = [];
              }
            }
          });
        }
        break;
      }
      case 'fetchfile': {
        let modalRef = this.modalService.open(NewDialogComponent, {
          windowClass: 'animated fadeInDown',
          size: 'md',
        });
        modalRef.componentInstance.action = item.action;
        modalRef.result.then(async (res: any) => {
          if (res.status) {
            this.loading = true;
            const context = {
              source: res.name,
              destination: route,
            };
            const data = this.configuration('fetchRemoteFile', context);
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
              this.initGetData(this.currentUser);
              this.activeFooterMenu(this.footerMenuItems, false);
            }
          }
        });
        break;
      }
      case 'cut': {
        this.itemTargetMulti = [];
        for (let i of this.arrFolderFile) {
          if (i.isActive) {
            this.itemTargetMulti.push(i);
          }
        }
        const temp = this.currentUser.configuration.initialDirectory;
        this.beforeInitialDirectory = temp;
        for (let i of this.footerMenuItems) {
          if (i.action == 'paste') {
            i.isActive = false;
            i.isDisabled = false;
          }
        }
        this.isPaste = true;
        if (this.itemTargetMulti.length > 1) {
          this.isCut = true;
          this.isCopy = false;
          this.copyItem = {};
          this.cutItem = {};
        } else {
          this.isCut = true;
          this.isCopy = false;
          this.copyItem = {};
          this.cutItem = this.ff;
        }
        break;
      }
      case 'copy': {
        this.itemTargetMulti = [];
        for (let i of this.arrFolderFile) {
          if (i.isActive) {
            this.itemTargetMulti.push(i);
          }
        }
        const temp = this.currentUser.configuration.initialDirectory;
        this.beforeInitialDirectory = temp;
        for (let i of this.footerMenuItems) {
          if (i.action == 'paste') {
            i.isActive = false;
            i.isDisabled = false;
          }
        }
        this.isPaste = true;
        if (this.itemTargetMulti.length > 1) {
          this.isCut = false;
          this.isCopy = true;
          this.copyItem = {};
          this.cutItem = {};
        } else {
          this.isCut = false;
          this.isCopy = true;
          this.cutItem = {};
          this.copyItem = this.ff;
        }
        break;
      }
      case 'paste': {
        this.loading = true;
        let beforeInitialDirectory;
        if (this.beforeInitialDirectory == '/') {
          beforeInitialDirectory = '';
        } else {
          beforeInitialDirectory = this.beforeInitialDirectory;
        }
        if (this.itemTargetMulti.length == 1) {
          if (this.isCut) {
            const copyItem = this.cutItem;
            const copyFileName = this.cutItem.name;
            const newName = this.checkCopyName(copyItem, this.arrFolderFile);
            const context = {
              source: beforeInitialDirectory + '/' + copyFileName,
              destination: route == '/' ? '/' + newName : route + '/' + newName,
              action: 'move',
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
              this.initGetData(this.currentUser);
              this.activeFooterMenu(this.footerMenuItems, false);
              this.isCut = false;
              this.cutItem = {};
              for (let i of this.footerMenuItems) {
                if (i.action == 'paste') {
                  i.isActive = true;
                  i.isDisabled = false;
                }
              }
              this.isPaste = false;
            }
          }
          if (this.isCopy) {
            const copyItem = this.copyItem;
            const copyFileName = this.copyItem.name;
            const newName = this.checkCopyName(copyItem, this.arrFolderFile);
            const context = {
              source: beforeInitialDirectory + '/' + copyFileName,
              destination: route == '/' ? '/' + newName : route + '/' + newName,
            };
            const data = this.configuration('copy', context);
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
              this.initGetData(this.currentUser);
              this.activeFooterMenu(this.footerMenuItems, false);
            }
          }
        } else {
          if (this.isCut) {
            let count = 0;
            for (let i of this.itemTargetMulti) {
              const copyItem = i;
              const copyFileName = i.name;
              const newName = this.checkCopyName(copyItem, this.arrFolderFile);
              const context = {
                source: beforeInitialDirectory + '/' + copyFileName,
                destination:
                  route == '/' ? '/' + newName : route + '/' + newName,
                action: 'move',
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
                count++;
              }
            }
            if (count == this.itemTargetMulti.length) {
              this.initGetData(this.currentUser);
              this.activeFooterMenu(this.footerMenuItems, false);
              this.isCut = false;
              this.itemTargetMulti = [];
              for (let i of this.footerMenuItems) {
                if (i.action == 'paste') {
                  i.isActive = true;
                  i.isDisabled = false;
                }
              }
              this.isPaste = false;
            }
          }
          if (this.isCopy) {
            let count = 0;
            for (let i of this.itemTargetMulti) {
              const copyItem = i;
              const copyFileName = i.name;
              const newName = this.checkCopyName(copyItem, this.arrFolderFile);
              const context = {
                source: beforeInitialDirectory + '/' + copyFileName,
                destination:
                  route == '/' ? '/' + newName : route + '/' + newName,
              };
              const data = this.configuration('copy', context);
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
                count++;
              }
            }

            if (count == this.itemTargetMulti.length) {
              this.initGetData(this.currentUser);
              this.activeFooterMenu(this.footerMenuItems, false);
            }
          }
        }
        break;
      }
      case 'showeditor': {
        if (!item.isActive) {
          this.initEditorFile(this.ff.name, this.arrEditorFile);
          let modalRef = this.modalService.open(EditDialogComponent, {
            windowClass: 'animated fadeInDown',
            fullscreen: true,
          });
          modalRef.componentInstance.language = this.extractFileExtension(
            this.ff.name
          );
          modalRef.componentInstance.arrHistory = this.arrEditorFile;
          modalRef.componentInstance.item = this.ff;
          modalRef.componentInstance.user = this.currentUser;
          modalRef.result.then(async (res: any) => {
            if (res.status) {
              this.arrEditorFile = res.arrHistory;
              this.initGetData(this.currentUser);
            }
          });
        }
        break;
      }
      case 'chmod': {
        this.itemTargetMultiCHMOD = [];
        for (let i of this.arrFolderFile) {
          if (i.isActive) {
            this.itemTargetMultiCHMOD.push(i);
          }
        }
        this.openPermission(this.ff, this.itemTargetMultiCHMOD);
        break;
      }
    }
  }

  initEditorFile(name: any, arrEditorFile: any) {
    const file = {
      name: name,
      initialDirectory: this.currentUser.configuration.initialDirectory,
      fileName:
        this.currentUser.configuration.initialDirectory == '/'
          ? '/' + name
          : this.currentUser.configuration.initialDirectory + '/' + name,
    };

    const index = arrEditorFile.findIndex((object: any) => {
      return object.fileName == file.fileName;
    });
    if (index == -1) {
      arrEditorFile.push(file);
    }
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

  openInfo() {
    this.isOpenInfo = !this.isOpenInfo;
    this.footerItem = {
      action: 'info',
      icon: 'pen',
      isActive: false,
      isDisabled: false,
      isOpen: this.isOpenInfo,
      name: '',
      tooltips: '',
      type: 'fas',
    };
  }
}
