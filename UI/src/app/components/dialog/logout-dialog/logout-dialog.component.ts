import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-logout-dialog',
  templateUrl: './logout-dialog.component.html',
  styleUrls: ['./logout-dialog.component.scss'],
})
export class LogoutDialogComponent implements OnInit {
  constructor(private modalActive: NgbActiveModal) {}

  ngOnInit(): void {}
  close() {
    this.modalActive.close(false);
  }
  confirm() {
    this.modalActive.close(true);
  }
}
