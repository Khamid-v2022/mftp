import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { lastValueFrom } from 'rxjs';
import { AuthService } from 'services';
import { debounce } from 'lodash';
import { NewDialogComponent } from '../new-dialog';
import { ErrorDialogComponent } from '../error-dialog';
@Component({
  selector: 'app-edit-dialog',
  templateUrl: './edit-dialog.component.html',
  styleUrls: ['./edit-dialog.component.scss'],
})
export class EditDialogComponent implements OnInit {
  loading: boolean = false;
  autoSave: boolean = false;
  @Input() language: string = '';
  @Input() item: any;
  @Input() user: any;
  @Input() arrHistory: any;
  show: boolean = false;
  editorOptions = { language: '' };
  code: string = '';
  originalFileContents: string = '';
  intervalRun: any;
  currentfile: string = '';
  constructor(
    private modalService: NgbModal,
    private authService: AuthService,
    private modalActive: NgbActiveModal
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.editorOptions.language = this.language;
    this.initData();
    this.currentfile =
      this.user.configuration.initialDirectory == '/'
        ? '/' + this.item.name
        : this.user.configuration.initialDirectory + '/' + this.item.name;
  }
  async initData() {
    const context = {
      remotePath: this.user.context.path + '/' + this.item.name,
    };
    const data = this.configuration('getFileContents', context);
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
      this.originalFileContents = result.data;
      this.code = this.b64DecodeUnicode(result.data);
      this.loading = false;
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
  configuration(action: string, context: any) {
    const configuration = {
      connectionType: 'ftp',
      configuration: this.user.configuration,
      actionName: action,
      context: context,
    };

    let dataF = new FormData();
    dataF.append('request', JSON.stringify(configuration));
    return dataF;
  }
  close() {
    this.modalActive.close({ status: true, arrHistory: this.arrHistory });
  }
  toggleHistory() {
    this.show = !this.show;
  }
  changeFile(item: any) {
    this.user.context.path = item.initialDirectory;
    this.item.name = item.name;
    this.loading = true;
    this.show = false;
    this.currentfile = item.fileName;
    this.initData();
  }
  remove(item: any) {
    this.arrHistory.splice(this.arrHistory.indexOf(item), 1);
  }

  changeCode = debounce((e: any) => {
    if (this.autoSave) {
      const context = {
        remotePath: this.user.context.path + '/' + this.item.name,
        fileContents: this.b64EncodeUnicode(this.code),
        originalFileContents: this.originalFileContents,
        confirmOverwrite: false,
      };
      const data = this.configuration('putFileContents', context);
      const result: any = lastValueFrom(this.authService.callAPI(data)).catch(
        (err) => err
      );
    }
  }, 5000);
  async save() {
    const context = {
      remotePath: this.user.context.path + '/' + this.item.name,
      fileContents: this.b64EncodeUnicode(this.code),
      originalFileContents: this.originalFileContents,
      confirmOverwrite: false,
    };

    const data = this.configuration('putFileContents', context);
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
      this.loading = false;
    }
  }
  b64EncodeUnicode(e: any) {
    return btoa(
      encodeURIComponent(e).replace(/%([0-9A-F]{2})/g, function (e, t) {
        return String.fromCharCode(parseInt('0x' + t));
      })
    );
  }
}
