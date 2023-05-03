import { atom } from 'recoil';

export const modalProjectInfoState = atom<boolean>({
  key: 'modalProjectInfoState',
  default: false,
});
