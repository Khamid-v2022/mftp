import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'services';

@Component({
  selector: 'app-setting-dialog',
  templateUrl: './setting-dialog.component.html',
  styleUrls: ['./setting-dialog.component.scss'],
})
export class SettingDialogComponent implements OnInit {
  language: string = '';
  constructor(
    private authService: AuthService,
    private modalActive: NgbActiveModal
  ) {}

  ngOnInit(): void {
    this.authService.systemVars.subscribe((res: any) => {
      this.language = res.applicationSettings.language;
    });
  }
  close() {
    this.modalActive.close({ status: false });
  }
  save() {
    this.modalActive.close({ status: false });
  }
}
