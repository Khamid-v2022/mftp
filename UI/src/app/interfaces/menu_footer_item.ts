import { IconName, IconPrefix } from '@fortawesome/fontawesome-common-types';

export interface MenuFooterItem {
  name: string;
  action: string;
  tooltips: string;
  icon: IconName;
  type: IconPrefix;
  isOpen: boolean;
  isActive: boolean;
  isDisabled: boolean;
}
