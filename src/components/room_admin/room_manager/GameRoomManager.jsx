import React, { useEffect, useState } from 'react';
import Navigation from '../dashboardadmin/negative';
import styles from './GameRoomManager.module.css';
import { useTranslation } from 'react-i18next';

const GameRoomManager = () => {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRooms, setTotalRooms] = useState(0);
  const [loading, setLoading] = useState({});
  const [filterOption, setFilterOption] = useState('all');
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const apiUrl = process.env.REACT_APP_API_URL;

  const roomsPerPage = 5;

  const fetchRooms = (page = currentPage, limit = roomsPerPage) => {
    const url = new URL(`${apiUrl}/admin/roommanager`);
    url.searchParams.append('page', page);
    url.searchParams.append('limit', limit);
    
    if (searchTerm) {
      url.searchParams.append('search', searchTerm);  // searchTerm now searches room_title too
    }
    
    if (filterOption !== 'all') {
      url.searchParams.append('filter', filterOption);
      if (filterOption === 'over_max') {
        url.searchParams.append('maxPlayers', maxPlayers);
      }
    }
  
    fetch(url.toString())
      .then(response => response.json())
      .then(data => {
        setRooms(data.rooms);
        setTotalRooms(data.total);
      })
      .catch(error => {
        console.error('There was an error fetching the rooms!', error);
      });
  };
  

  useEffect(() => {
    // Đảm bảo rằng khi filter hoặc search thay đổi, trang sẽ quay về 1
    setCurrentPage(1);
    fetchRooms(1); // Truyền trang 1 vào để lấy kết quả cho trang này
  }, [searchTerm, filterOption, maxPlayers]); // Chỉ theo dõi các giá trị này
  
  // Đảm bảo fetchRooms cũng được gọi khi currentPage thay đổi
  useEffect(() => {
    fetchRooms(currentPage);
  }, [currentPage]);
  

  const handleDelete = async (roomId) => {
    setLoading(prevLoading => ({ ...prevLoading, [roomId]: true }));
    try {
      const response = await fetch(`${apiUrl}/delete/room/${roomId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        const updatedRooms = rooms.filter(room => room.room_id !== roomId);
        setRooms(updatedRooms);
        setTotalRooms(totalRooms - 1);
      } else {
        console.error('Failed to delete the room');
      }
    } catch (error) {
      console.error('There was an error deleting the room!', error);
    } finally {
      setLoading(prevLoading => ({ ...prevLoading, [roomId]: false }));
    }
  };

  const handleFilterChange = (e) => {
    setFilterOption(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalRooms / roomsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPagination = () => {
    const pageNumbers = [];
    const maxPageButtons = 5;
    const halfMaxPageButtons = Math.floor(maxPageButtons / 2);

    let startPage = currentPage - halfMaxPageButtons;
    let endPage = currentPage + halfMaxPageButtons;

    if (startPage < 1) {
      startPage = 1;
      endPage = Math.min(totalPages, maxPageButtons);
    }

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, totalPages - maxPageButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className={styles.pagination}>
        {currentPage > 1 && (
          <button onClick={() => paginate(currentPage - 1)} className={styles.pageButton}>{t('gameRoomManager.previous')}</button>
        )}
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`${styles.pageButton} ${currentPage === number ? styles.active : ''}`}
          >
            {number}
          </button>
        ))}
        {currentPage < totalPages && (
          <button onClick={() => paginate(currentPage + 1)} className={styles.pageButton}>{t('gameRoomManager.next')}</button>
        )}
      </div>
    );
  };

  return (
    <div>
      <Navigation />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.heading}>{t('gameRoomManager.title')}</h1>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>{t('gameRoomManager.roomList')}</h3>
              <input
                type="text"
                placeholder={t('gameRoomManager.searchPlaceholder')}
                value={searchTerm}
                onChange={handleSearchChange}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.cardBody}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{t('gameRoomManager.roomID')}</th>
                    <th>{t('gameRoomManager.roomTitle')}</th>
                    <th>{t('gameRoomManager.roomOwner')}</th>
                    <th>{t('gameRoomManager.roomMembers')}</th>
                    <th>{t('gameRoomManager.roomStatus')}</th>
                    <th>{t('gameRoomManager.roomActions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map(room => (
                    <tr key={room.room_id}>
                      <td>{room.room_id}</td>
                      <td className={styles.roomTitle}>{room.room_title}</td>
                      <td>
                        <div>{room.admin_fullname}</div>
                        <div>({room.room_owner})</div>
                      </td>
                      <td>{room.room_members}</td>
                      <td>{room.room_type}</td>
                      <td>
                        <button
                          className={`${styles.button} ${loading[room.room_id] ? styles.buttonDeleting : ''}`}
                          onClick={() => handleDelete(room.room_id)}
                          disabled={loading[room.room_id]}
                        >
                          {loading[room.room_id] ? t('gameRoomManager.deleting') : t('gameRoomManager.delete')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {renderPagination()}
            </div>
          </div>
        </div>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>{t('gameRoomManager.roomFilters')}</h3>
            </div>
            <div className={styles.cardBody2}>
              <label>
                <input
                  type="radio"
                  value="all"
                  checked={filterOption === 'all'}
                  onChange={handleFilterChange}
                />
                {t('gameRoomManager.allRooms')}
              </label>
              <label>
                <input
                  type="radio"
                  value="empty"
                  checked={filterOption === 'empty'}
                  onChange={handleFilterChange}
                />
                {t('gameRoomManager.emptyRooms')}
              </label>
              <label>
                <input
                  type="radio"
                  value="over_max"
                  checked={filterOption === 'over_max'}
                  onChange={handleFilterChange}
                />
                {t('gameRoomManager.overMaxRooms')}
                <input
                  type="number"
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(Number(e.target.value))}
                  style={{ width: '50px', marginLeft: '5px' }}
                /> {t('gameRoomManager.members')}
              </label>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GameRoomManager;
