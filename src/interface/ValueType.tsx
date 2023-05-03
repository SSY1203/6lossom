import { backgroundImageListType } from '@/data/backgroundImageList';

export interface ValueType {
  backgroundImageList: backgroundImageListType[];
  handleSelect: (e: React.MouseEvent<HTMLButtonElement>) => void;
}
