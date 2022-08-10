import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-chmod-dialog',
  templateUrl: './chmod-dialog.component.html',
  styleUrls: ['./chmod-dialog.component.scss'],
})
export class ChmodDialogComponent implements OnInit {
  @Input() item: any;
  @Input() arr: any;
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
  numericPermissions: number = 0;
  constructor(private modalActive: NgbActiveModal) {}

  ngOnInit(): void {
    if (this.arr.length == 1) {
      this.initPermission(this.item.numericPermissions);
    } else {
      this.initArrPermission();
    }
  }

  initArrPermission() {
    this.manual = 0;
    this.arrPermission = [
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
  }

  initPermission(numericPermissions: any) {
    const objectPermission = this.numericToObject(numericPermissions);

    this.manual = Number(numericPermissions.toString(8));

    this.arrPermission[0].read = objectPermission.ownerRead;
    this.arrPermission[0].write = objectPermission.ownerWrite;
    this.arrPermission[0].execute = objectPermission.ownerExecute;

    this.arrPermission[1].read = objectPermission.groupRead;
    this.arrPermission[1].write = objectPermission.groupWrite;
    this.arrPermission[1].execute = objectPermission.groupExecute;

    this.arrPermission[2].read = objectPermission.otherRead;
    this.arrPermission[2].write = objectPermission.otherWrite;
    this.arrPermission[2].execute = objectPermission.otherExecute;
  }

  changePerMission(per: any) {
    this.changeManual();
  }

  changeManual() {
    const objectPermission = {
      ownerRead: this.arrPermission[0].read,
      ownerWrite: this.arrPermission[0].write,
      ownerExecute: this.arrPermission[0].execute,
      groupRead: this.arrPermission[1].read,
      groupWrite: this.arrPermission[1].write,
      groupExecute: this.arrPermission[1].execute,
      otherRead: this.arrPermission[2].read,
      otherWrite: this.arrPermission[2].write,
      otherExecute: this.arrPermission[2].execute,
    };
    const numericPermissions: any = this.objectToNumeric(objectPermission);
    this.numericPermissions = numericPermissions;
    this.manual = Number(numericPermissions.toString(8));
  }

  save() {
    if (this.arr.length == 1) {
      this.modalActive.close({
        status: true,
        mode: this.numericPermissions,
        arr: [],
      });
    } else {
      this.modalActive.close({
        status: true,
        mode: this.numericPermissions,
        arr: this.arr,
      });
    }
  }

  close() {
    this.modalActive.close({ status: false });
  }
  changeManualNumber() {
    const numericPermissions = parseInt(this.manual.toString(), 8);
    this.initPermission(numericPermissions);
    this.numericPermissions = numericPermissions;
  }
  enter(e: any) {
    const keyCode = e.which || e.keyCode;
    if (keyCode === 13) {
      this.changeManualNumber();
      this.save();
    }
  }
  objectToNumeric(e: any) {
    return (
      (e.ownerRead ? 256 : 0) +
      (e.ownerWrite ? 128 : 0) +
      (e.ownerExecute ? 64 : 0) +
      (e.groupRead ? 32 : 0) +
      (e.groupWrite ? 16 : 0) +
      (e.groupExecute ? 8 : 0) +
      (e.otherRead ? 4 : 0) +
      (e.otherWrite ? 2 : 0) +
      (e.otherExecute ? 1 : 0)
    );
  }
  numericToObject(e: any) {
    return {
      ownerRead: 0 != (256 & e),
      ownerWrite: 0 != (128 & e),
      ownerExecute: 0 != (64 & e),
      groupRead: 0 != (32 & e),
      groupWrite: 0 != (16 & e),
      groupExecute: 0 != (8 & e),
      otherRead: 0 != (4 & e),
      otherWrite: 0 != (2 & e),
      otherExecute: 0 != (1 & e),
    };
  }
}
