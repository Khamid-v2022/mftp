import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
export interface Properties {
  dayStr: string;
  icon: string;
  isDirectory: true;
  isLink: boolean;
  linkCount: number;
  modificationDate: number;
  name: string;
  nameS: string;
  numericPermissions: number;
  ownerGroupName: string;
  ownerUserName: string;
  permissions: string;
  prefix: string;
  size: number;
  type: string;
}
@Component({
  selector: 'app-properties-dialog',
  templateUrl: './properties-dialog.component.html',
  styleUrls: ['./properties-dialog.component.scss'],
})
export class PropertiesDialogComponent implements OnInit {
  @Input() properties: Properties;
  constructor(private modalActive: NgbActiveModal) {}

  ngOnInit(): void {}
  close() {
    this.modalActive.close(false);
  }
}
