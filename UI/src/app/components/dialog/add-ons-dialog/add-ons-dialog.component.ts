import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-ons-dialog',
  templateUrl: './add-ons-dialog.component.html',
  styleUrls: ['./add-ons-dialog.component.scss'],
})
export class AddOnsDialogComponent implements OnInit {
  constructor(private modalActive: NgbActiveModal) {}

  ngOnInit(): void {}

  close() {
    this.modalActive.close(false);
  }
}
