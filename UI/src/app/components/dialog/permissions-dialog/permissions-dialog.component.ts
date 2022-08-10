import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-permissions-dialog',
  templateUrl: './permissions-dialog.component.html',
  styleUrls: ['./permissions-dialog.component.scss'],
})
export class PermissionsDialogComponent implements OnInit {
  arrPermission = [
    {
      id: 0,
      name: 'Owner',
      read: false,
      write: false,
      execute: false,
    },
    {
      id: 1,
      name: 'Group',
      read: false,
      write: false,
      execute: false,
    },
    {
      id: 2,
      name: 'Public',
      read: false,
      write: false,
      execute: false,
    },
  ];
  manual: number = 0;
  constructor(private modalActive: NgbActiveModal) {}

  ngOnInit(): void {}
  close() {
    this.modalActive.close(false);
  }
}
