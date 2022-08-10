import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { lastValueFrom } from 'rxjs';
import { AuthService } from 'services';
import { ErrorDialogComponent } from '../error-dialog';

@Component({
  selector: 'app-transfer-dialog',
  templateUrl: './transfer-dialog.component.html',
  styleUrls: ['./transfer-dialog.component.scss'],
})
export class TransferDialogComponent implements OnInit {
  @Input() namefile: string;
  @Input() fileKey: string;
  @Input() fileCount: number;
  @Input() user: any;
  width: string = '0%';
  constructor(
    private authService: AuthService,
    private modalActive: NgbActiveModal,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.initData();
  }
  close() {
    this.modalActive.close({ status: false });
  }

  async initData() {
    const contextExtract = {
      fileKey: this.fileKey,
      fileIndexOffset: 0,
      extractCount: 10000,
    };
    this.width = '50%';
    const data = this.configuration('extractArchive', contextExtract);
    const resultExtract: any = await lastValueFrom(
      this.authService.callAPIWithCredentials(data)
    ).catch((err) => {
      let modalRef = this.modalService.open(ErrorDialogComponent, {
        windowClass: 'animated fadeInDown',
        size: 'md',
      });
      modalRef.componentInstance.error = err.error.errors[0];
    });
    if (resultExtract.success) {
      this.width = '100%';
      this.modalActive.close({ status: true });
    }
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
}
