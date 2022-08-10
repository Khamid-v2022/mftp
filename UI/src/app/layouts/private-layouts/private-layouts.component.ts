import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from 'services';
import { IconName, IconPrefix } from '@fortawesome/fontawesome-common-types';
import { ChangeDetectorRef } from '@angular/core';
import { SimpleChanges } from '@angular/core';

export interface FileFolder {
  dayStr: string;
  icon: IconName;
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
  type: IconPrefix;
  checkDate: boolean;
  isActive: boolean;
}
export interface MenuFooter {
  action: String;
  icon: String;
  isActive: Boolean;
  isDisabled: Boolean;
  isOpen: Boolean;
  name: String;
  tooltips: String;
  type: String;
}
@Component({
  selector: 'app-private-layouts',
  templateUrl: './private-layouts.component.html',
  styleUrls: ['./private-layouts.component.scss'],
})
export class PrivateLayoutsComponent implements OnInit {
  isCollapse: boolean = false;
  isToggle: boolean = false;
  isRefresh: boolean = false;
  backForwardArr: any;
  backForwardAc: any;
  titleText: string = '';
  isMobile: boolean = false;
  innerWidth: any;
  choosenFileFolder: any;
  footerMenu: MenuFooter = {
    action: '',
    icon: '',
    isActive: false,
    isDisabled: false,
    isOpen: false,
    name: '',
    tooltips: '',
    type: '',
  };
  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cd.detectChanges();
  }

  clickBackForwardAction(ev: any) {
    this.backForwardAc = ev;
  }
  clickArr(ev: any) {
    this.backForwardArr = ev;
  }
  onClickChooseFile(ev: any) {
    this.choosenFileFolder = ev;
  }
  onClickFooterItem(ev: any): void {
    this.footerMenu = ev;
  }
}
