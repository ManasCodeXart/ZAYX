import type { ImageSourcePropType } from 'react-native';


export interface ActionItem {
  readonly id: string;
  readonly label: string;
  readonly icon: ImageSourcePropType;
}


export type DrawerPage = 'actions' | 'insights';