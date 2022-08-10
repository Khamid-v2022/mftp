import { IconName, IconPrefix } from '@fortawesome/fontawesome-common-types';

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
