import { atom } from 'recoil';
import { FlowerInfoType } from '@/interface/FlowerInfoType';

export const flowerInfoState = atom<FlowerInfoType>({
  key: 'flowerInfo',
  default: {} as FlowerInfoType,
});
