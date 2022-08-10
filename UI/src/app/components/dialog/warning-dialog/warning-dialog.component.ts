import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-warning-dialog',
  templateUrl: './warning-dialog.component.html',
  styleUrls: ['./warning-dialog.component.scss'],
})
export class WarningDialogComponent implements OnInit {
  @Input() text: String = '';
  constructor(private modalActive: NgbActiveModal) {}

  ngOnInit(): void {}
  close() {
    this.modalActive.close(false);
  }
  confirm() {
    this.modalActive.close(true);
  }
}
