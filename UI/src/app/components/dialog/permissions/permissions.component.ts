import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.scss'],
})
export class PermissionsComponent implements OnInit {
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
