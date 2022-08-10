import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-new-dialog',
  templateUrl: './new-dialog.component.html',
  styleUrls: ['./new-dialog.component.scss'],
})
export class NewDialogComponent implements OnInit {
  @Input() action: string = '';
  @Input() oldName: string = '';
  name: string = '';
  constructor(private modalActive: NgbActiveModal) {}

  ngOnInit(): void {
    if (this.action == 'rename') {
      this.name = this.oldName;
    } else if (this.action == 'zip') {
      let today = new Date();
      const date = this.checkDate(today);
      this.name = 'mftp-' + date + '.zip';
    }
  }
  close() {
    this.modalActive.close({ status: false });
  }
  save() {
    this.modalActive.close({ status: true, name: this.name });
  }
  enter(e: any) {
    const keyCode = e.which || e.keyCode;
    if (keyCode === 13) {
      this.save();
    }
  }
  checkDate(day: any) {
    const yyyy = day.getFullYear();
    let MM = day.getMonth() + 1;
    let dd = day.getDate();
    let hh = day.getHours();
    let mm = day.getMinutes();
    let ss = day.getSeconds();
    if (dd < 10) dd = '0' + dd;
    if (MM < 10) MM = '0' + MM;
    if (hh < 10) hh = '0' + hh;
    if (mm < 10) mm = '0' + mm;
    if (ss < 10) ss = '0' + ss;
    return yyyy + '-' + MM + '-' + dd + '-' + hh + '-' + mm + '-' + ss;
  }
}
