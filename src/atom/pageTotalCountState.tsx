import { atom } from 'recoil';

export const pageTotalCountState = atom<number>({
  key: 'pageTotalCountState',
  default: 0,
});
