import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { lastValueFrom } from 'rxjs';
import { AuthService } from 'services';
import { ErrorDialogComponent } from '../error-dialog';
import { IconName, IconPrefix } from '@fortawesome/fontawesome-common-types';
@Component({
  selector: 'app-upload-dialog',
  templateUrl: './upload-dialog.component.html',
  styleUrls: ['./upload-dialog.component.scss'],
})
export class UploadDialogComponent implements OnInit {
  @Input() files: any;
  @Input() user: any;
  @Input() totalFileSize: number;
  @Input() totalFileSizeStr: string;
  @Input() type: string;
  @Input() zip: boolean;
  @Input() uploadChunk: boolean;
  isUploading: boolean = true;
  isProgress: boolean = false;
  countAll: number = 0;
  fileCount: number = 0;
  namefile: string = '';
  width: string = '0%';
  size: number = 0;
  sizeStr: string = '';
  typeIcon: IconPrefix = 'fas';
  typeFile: IconName = 'file';
  constructor(
    private authService: AuthService,
    private modalService: NgbModal,
    private modalActive: NgbActiveModal
  ) {}

  ngOnInit(): void {
    this.countAll = this.files.length;
    if (this.type == 'folder') {
      this.namefile = this.files[0]['webkitRelativePath'];
    } else {
      this.namefile = this.files[0]['name'];
    }
    this.size = 0;
    this.sizeStr = '0KB';
    this.typeFile = this.files[0]['typeFile'];
    // this.width = (this.files[0]['size'] / this.totalFileSize) * 100 + '%';
    this.fileCount = 0;
    if (this.uploadChunk) {
      this.initUploadUnchunk();
    } else {
      this.initUploadMultiStage();
    }
  }
  initUploadMultiStage() {
    for (let i = 0; i < this.files.length; i++) {
      var reader = new FileReader();
      let self = this;
      let count = 0;
      let name = '';
      if (self.type == 'folder') {
        name = self.files[i]['webkitRelativePath'];
      } else {
        name = self.files[i]['name'];
      }
      //Initiate
      reader.onload = async (_event: any) => {
        const dataFile = _event.target.result;
        const route = self.user.configuration.initialDirectory;
        const context = {
          remotePath: route == '/' ? '/' + name : route + '/' + name,
          localPath: route == '/' ? '/' + name : route + '/' + name,
          actionName: 'uploadFileToNewDirectory',
        };
        console.log(context);

        const form = self.configuration('reserveUploadContext', context);
        await lastValueFrom(self.authService.callAPI(form))
          .then(async (result) => {
            if (result.success) {
              const data = {
                sessionKey: result.data,
              };
              await lastValueFrom(
                self.authService.uploadMultiStage(data, dataFile)
              )
                .then(async (result) => {
                  console.log(result);
                })
                .catch((err) => {
                  let modalRef = self.modalService.open(ErrorDialogComponent, {
                    windowClass: 'animated fadeInDown',
                    size: 'md',
                  });
                  modalRef.componentInstance.error = err.error.errors[0];
                });
            }
          })
          .catch((err) => {
            let modalRef = self.modalService.open(ErrorDialogComponent, {
              windowClass: 'animated fadeInDown',
              size: 'md',
            });
            modalRef.componentInstance.error = err.error.errors[0];
          });
      };
      reader.readAsArrayBuffer(this.files[i]);
    }
  }

  initUploadUnchunk() {
    for (let i = 0; i < this.files.length; i++) {
      var reader = new FileReader();
      let self = this;
      let count = 0;
      reader.onload = async (_event: any) => {
        const dataFile = _event.target.result;
        const route = self.user.configuration.initialDirectory;
        let name = '';
        if (self.type == 'folder') {
          name = self.files[i]['webkitRelativePath'];
        } else {
          name = self.files[i]['name'];
        }
        //Initiate
        const context = {
          remotePath: route == '/' ? '/' + name : route + '/' + name,
        };

        const uploadId = self.random(16);
        const data = {
          action: 'initiate',
          uploadId,
        };
        const form = self.configuration('uploadFileToNewDirectory', context);
        await lastValueFrom(
          self.authService.upload(form, data, this.uploadChunk)
        )
          .then(async () => {
              const blobTosend = new Blob([dataFile]);
              self.namefile = name;
              self.size += self.files[i]['size'];
              self.sizeStr = self.normalizeFileSize(self.size);
              self.typeFile = self.files[i]['typeFile'];
              const size = (self.size / self.totalFileSize) * 100;
              self.width = size + '%';
              self.fileCount++;
              const objBlob = {
                blob: blobTosend,
                uploadId,
                context,
              };

              if (await self.progress(objBlob)) {
                count++;
              }
              if (i == count) {
                this.modalActive.close({ status: true });
              }
          })
          .catch((err) => {
            if (err.error) {
              let modalRef = self.modalService.open(ErrorDialogComponent, {
                windowClass: 'animated fadeInDown',
                size: 'md',
              });
              modalRef.componentInstance.error = err.error.errors[0];
            }
            
          });
      };
      reader.readAsDataURL(this.files[i]);
    }
  }

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

  async progress(objBlob: any): Promise<any> {
    //progress
    const dataProgress = {
      action: 'progress',
      uploadId: objBlob.uploadId,
    };
    await lastValueFrom(
      this.authService.uploadChunk(objBlob.blob, dataProgress)
    )
      .then(async (result: any): Promise<any> => {
        const objProgress = {
          uploadId: objBlob.uploadId,
          context: objBlob.context,
        };
        if (await this.finish(objProgress, this.zip)) {
          return true;
        }
      })
      .catch((err) => {
        let modalRef = this.modalService.open(ErrorDialogComponent, {
          windowClass: 'animated fadeInDown',
          size: 'md',
        });
        modalRef.componentInstance.error = err.error.errors[0];
      });
  }

  async finish(objProgress: any, zip: boolean): Promise<any> {
    //finish
    const dataFinish = {
      action: 'finish',
      uploadId: objProgress.uploadId,
    };
    let formFinish;
    if (zip) {
      formFinish = this.configuration('uploadArchive', objProgress.context);
    } else {
      formFinish = this.configuration(
        'uploadFileToNewDirectory',
        objProgress.context
      );
    }

    await lastValueFrom(this.authService.uploadChunk(formFinish, dataFinish))
      .then(async (result): Promise<any> => {
        if (result && result.success) {
          this.isUploading = false;
          this.isProgress = true;
          return true;
        }
      })
      .catch((err) => {
        let modalRef = this.modalService.open(ErrorDialogComponent, {
          windowClass: 'animated fadeInDown',
          size: 'md',
        });
        modalRef.componentInstance.error = err.error.errors[0];
      });
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

  random(e: number) {
    for (
      var t = '',
        n = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      t.length < e;

    )
      t += n.charAt(Math.floor(Math.random() * n.length));
    return t;
  }
  close() {
    this.modalActive.close({ status: false });
  }
}
