import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import style from './ShareTreePage.module.scss';
import rightButton from '@/assets/swiper-button/right.png';
import leftButton from '@/assets/swiper-button/left.png';

import messageContext from '@/contexts/messageContext';
import flowerContext from '@/contexts/flowerContext';

import Header from '@/components/Header/Header';
import OriginTree from '@/components/OriginTree/OriginTree';
import LongButtonList from '@/components/LongButtonList/LongButtonList';
import HamburgerButton from '@/components/HamburgerButton/HamburgerButton';
import SideMenu from '@/components/SideMenu/SideMenu';
import MessageList from '@/components/MessageList/MessageList';
import MessageDetail from '@/components/MessageDetail/MessageDetail';
import { db, useCallCollection } from '@/firebase/app';
import {
  collection,
  doc,
  endBefore,
  getCountFromServer,
  getDocs,
  limit,
  limitToLast,
  onSnapshot,
  orderBy,
  query,
  startAfter,
} from 'firebase/firestore';
import classNames from 'classnames';
import Flower from '@/components/Flower/Flower';
import ModalProjectInfo from '@/components/ModalProjectInfo/ModalProjectInfo';
import Notification from '@/components/Notification/Notification';

const ShareTreePage = () => {
  const [messageListVisible, setMessageListVisible] = useState(false);
  const [messageDetailVisible, setMessageDetailVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [flowerInfo, setFlowerInfo] = useState({});
  const [modal, setModal] = useState(false);

  const { uid } = useParams();
  const listBackgroundRef = useRef();
  const messageListRef = useRef();
  const messageDetailRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  const messageVisibility = useMemo(
    () => ({
      messageListVisible,
      setMessageListVisible,
      messageDetailVisible,
      setMessageDetailVisible,
    }),
    [
      messageListVisible,
      setMessageListVisible,
      messageDetailVisible,
      setMessageDetailVisible,
    ]
  );

  // 공유 트리 페이지의 주인
  const [userNickname, setUserNickname] = useState('');
  const [bgSrc, setBgSrc] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [flowerList, setFlowerList] = useState([]);
  const [firstVisible, setFirstVisible] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [pageTotalCount, setPageTotalCount] = useState(0);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [renderList, setRenderList] = useState([]);

  const preventGoBack = () => {
    history.pushState(null, '', location.href);
  };

  useEffect(() => {}, []);

  useLayoutEffect(() => {
    getPageTotalCount();
    queryPage(6, 'next');
  }, []);

  useLayoutEffect(() => {
    setHasNextPage(flowerList.length === pageTotalCount ? false : true);
    setHasPrevPage(flowerList.length <= 6 ? false : true);
  }, [flowerList.length, pageTotalCount]);

  const flowerListRef = collection(db, `users/${uid}/flowerList`);

  const getPageTotalCount = async () => {
    const res = await getCountFromServer(
      query(flowerListRef, orderBy('createAt', 'asc'))
    );

    setPageTotalCount(res.data().count);
  };

  const queryPage = async (limitCount = 10, text) => {
    let q;

    switch (text) {
      case 'prev':
        if (!firstVisible) {
          q = query(
            flowerListRef,
            orderBy('createAt', 'asc'),
            limit(limitCount)
          );
        } else {
          q = query(
            flowerListRef,
            orderBy('createAt', 'asc'),
            endBefore(firstVisible),
            limitToLast(limitCount)
          );
        }
        break;
      case 'next':
        if (!lastVisible) {
          q = query(flowerListRef, orderBy('createAt'), limit(limitCount));
        } else {
          q = query(
            flowerListRef,
            orderBy('createAt'),
            startAfter(lastVisible),
            limit(limitCount)
          );
        }
        break;
    }

    const docSnapshot = await getDocs(q);

    if (isLoading) {
      setIsLoading(false);
    }

    const docs = docSnapshot.docs;
    queryData(docs, text);
  };

  const queryData = (docs, text) => {
    const listItem = [];

    docs.forEach((doc) => {
      listItem.push({ id: doc.id, ...doc.data() });
    });

    switch (text) {
      case 'prev':
        setFlowerList(
          flowerList.slice(
            undefined,
            Number(lastVisible.id + 1) % 6 === 0
              ? Number(lastVisible.id) - 6
              : Number(lastVisible.id) - (Number(lastVisible.id) % 6)
          )
        );
        break;
      case 'next':
        setFlowerList([...flowerList, ...listItem]);
        break;
    }

    setRenderList(listItem);

    let prevDoc = docs[0];
    if (prevDoc) setFirstVisible(prevDoc);

    let nextDoc = docs[docs.length - 1];
    if (nextDoc) setLastVisible(nextDoc);
  };

  // 로그인 한 사용자
  const localUid = JSON.parse(localStorage.getItem('uid'));
  const [localNickname, setLocalNickname] = useState('');

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleCopyLink = () => {
    let url = `https://localhost:3000${location.pathname}`;

    navigator.clipboard.writeText(url);

    alert('링크가 복사되었습니다.');
  };

  const handleOpenMessageDetail = (messageVisibility, message) => {
    const { messageDetailVisible, setMessageDetailVisible } = messageVisibility;
    const backgroundElement = messageDetailRef.current;
    setFlowerInfo(message);

    if (uid !== localUid) {
      const checkOwnerNotification = document.querySelector(
        '.targetCheckOwnerNotification'
      );
      checkOwnerNotification.classList.add(style.animateNotification);
      setTimeout(() => {
        checkOwnerNotification.classList.remove(style.animateNotification);
      }, 3000);
      return;
    }

    if (!messageDetailVisible) {
      backgroundElement.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
      backgroundElement.style.zIndex = 102;
      backgroundElement.style.display = 'block';

      setMessageDetailVisible(!messageDetailVisible);
    }
  };

  const handleOpenMessageList = (e, messageVisibility) => {
    const { messageListVisible, setMessageListVisible } = messageVisibility;
    const backgroundElement = listBackgroundRef.current;
    const messageListElement = messageListRef.current;

    if (!messageListVisible) {
      messageListElement.classList.add(style.moveIn);
      backgroundElement.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
      backgroundElement.style.zIndex = 101;
      backgroundElement.style.display = 'block';

      setMessageListVisible(!messageListVisible);
      setTimeout(() => {
        messageListElement.classList.remove(style.moveIn);
      }, 900);
    }
  };

  const handleCreateMessage = () => {
    if (!active) {
      alert('3월 15일부터 4월 14일까지 메세지 작성할 수 있습니다.');
    } else {
      navigate(`/message-custom/${uid}`);
    }
  };

  const handleWatchTree = () => {
    if (localUid) {
      window.location.replace(`/share-tree/${localUid}`);
    } else {
      alert('로그인이 필요합니다.');
      navigate('/');
      localStorage.clear();
    }
  };

  const handleModal = () => {
    setModal(!modal);
  };

  const today = new Date();
  const [msgActive, setMsgActive] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'users', uid), (doc) => {
      setUserNickname(doc.data().userNickname);
      setBgSrc(doc.data().bgSrc);
    });

    useCallCollection('users').then((userList) => {
      userList.map((user) => {
        if (user.uid === localUid) {
          setLocalNickname(user.userNickname);
        }
      });
    });

    const msgStartDate = new Date(today.getFullYear(), 3, 15);
    const msgEndDate = new Date(today.getFullYear(), 3, 29);

    const startDate = new Date(today.getFullYear(), 2, 15);
    const endDate = new Date(today.getFullYear(), 3, 14);

    const isMsgActive = today >= msgStartDate && today <= msgEndDate;
    setMsgActive(isMsgActive);
    const isActive = today >= startDate && today <= endDate;
    setActive(isActive);

    history.pushState(null, '', location.href);
    window.addEventListener('popstate', preventGoBack);

    return () => {
      window.removeEventListener('popstate', preventGoBack);
    };
  }, []);

  return (
    <>
      <messageContext.Provider value={messageVisibility}>
        <flowerContext.Provider value={{ flowerInfo, setFlowerInfo }}>
          <div
            style={{ background: `url(${bgSrc}) center no-repeat` }}
            className={style.shareTreeContainer}
          >
            <Header
              userName={userNickname}
              className={style.shareTreeSubTitle}
              subText={`${pageTotalCount}송이의 벚꽃이 피었어요 ! `}
            />
            <div className={style.blossomTreeContainer}>
              {isLoading ? (
                <div>Loading...</div>
              ) : (
                <div className={style.flowerList}>
                  <OriginTree />
                  <span className={style.pagination}>
                    {flowerList.length}/{pageTotalCount}
                  </span>
                  <button
                    className={classNames(style.arrowButton, style.leftButton)}
                    disabled={!hasPrevPage}
                    onClick={() => queryPage(6, 'prev')}
                  >
                    <img src={leftButton} alt="이전 페이지 보기" />
                  </button>
                  <button
                    className={classNames(style.arrowButton, style.rightButton)}
                    disabled={!hasNextPage}
                    onClick={() => queryPage(6, 'next')}
                  >
                    <img src={rightButton} alt="다음 페이지 보기" />
                  </button>
                  <ul>
                    {renderList.map((item) =>
                      msgActive ? (
                        <Flower
                          uid={uid}
                          item={item}
                          handleOpenMessageDetail={handleOpenMessageDetail}
                        />
                      ) : (
                        <Flower
                          disabled={!msgActive}
                          item={item}
                          uid={uid}
                          handleOpenMessageDetail={handleOpenMessageDetail}
                        />
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>

            <Notification
              className={classNames(
                'targetCheckOwnerNotification',
                style.notificationStyling
              )}
              text={'벚꽃나무의 주인만이 메세지 확인이 가능합니다 !'}
            />

            {uid === localUid ? (
              <LongButtonList
                firstText={'링크 공유하기'}
                firstClick={handleCopyLink}
                secondText={'전체 메세지 보기'}
                secondClick={(e) => handleOpenMessageList(e, messageVisibility)}
              />
            ) : active ? (
              <LongButtonList
                firstText={'벚꽃 달아주기'}
                firstClick={handleCreateMessage}
                secondText={'내 벚꽃나무 보러가기'}
                secondClick={handleWatchTree}
              />
            ) : (
              <LongButtonList
                firstText={'벚꽃 달아주기'}
                firstClick={handleCreateMessage}
                secondText={'내 벚꽃나무 보러가기'}
                secondClick={handleWatchTree}
              />
            )}
            <div onClick={handleMenuClick}>
              <HamburgerButton />
            </div>
            {isMenuOpen && (
              <SideMenu handleModal={handleModal} loginName={localNickname} />
            )}
          </div>

          <MessageList
            flowerList={flowerList}
            listBackgroundRef={listBackgroundRef}
            messageListRef={messageListRef}
            handleOpenMessageDetail={handleOpenMessageDetail}
          />
          <MessageDetail
            flowerInfo={flowerInfo}
            messageDetailRef={messageDetailRef}
          />
        </flowerContext.Provider>
      </messageContext.Provider>
      {modal ? <ModalProjectInfo handleModal={handleModal} /> : null}
    </>
  );
};

export default ShareTreePage;
