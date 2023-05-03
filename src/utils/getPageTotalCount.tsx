import { pageTotalCountState } from '@/atom/pageTotalCountState';
import { db } from '@/firebase/app';
import {
  collection,
  getCountFromServer,
  orderBy,
  query,
} from 'firebase/firestore';
import { useSetRecoilState } from 'recoil';

const setPageTotalCount = useSetRecoilState(pageTotalCountState);

export const getPageTotalCount = async (uid: string | undefined) => {
  const flowerListRef = collection(db, `users/${uid}/flowerList`);
  const res = await getCountFromServer(
    query(flowerListRef, orderBy('createAt', 'asc'))
  );

  setPageTotalCount(res.data().count);
};
