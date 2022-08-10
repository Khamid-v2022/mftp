import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-archive-dialog',
  templateUrl: './archive-dialog.component.html',
  styleUrls: ['./archive-dialog.component.scss'],
})
export class ArchiveDialogComponent implements OnInit {
  @Input() name: string;
  constructor(private modalActive: NgbActiveModal) {}

  ngOnInit(): void {}
  upload() {
    this.modalActive.close({ status: true, zip: false });
  }
  uploadZip() {
    this.modalActive.close({ status: true, zip: true });
  }
  close() {
    this.modalActive.close({ status: false });
  }
}
