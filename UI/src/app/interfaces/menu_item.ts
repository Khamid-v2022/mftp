import { IconName, IconPrefix } from '@fortawesome/fontawesome-common-types';

export interface MenuItem {
  menuText: string;
  action: string;
  menuLink: string;
  icon: IconName;
  type: IconPrefix;
  isActive: Boolean;
}
