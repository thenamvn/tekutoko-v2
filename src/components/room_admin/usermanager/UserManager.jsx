import React, { useEffect, useState } from 'react';
import styles from './UserManager.module.css';
import Navigation from '../dashboardadmin/negative';
import { useTranslation } from 'react-i18next';

const UserManager = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [filterOption, setFilterOption] = useState('all');
  const [minCreatedRooms, setMinCreatedRooms] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const apiUrl = process.env.REACT_APP_API_URL;
  const [loading, setLoading] = useState({});
  const usersPerPage = 5;

  const fetchUsers = (params) => {
    const url = new URL(`${apiUrl}/admin/users`);
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  
    fetch(url.toString())
      .then(response => response.json())
      .then(data => {
        setUsers(data.users);
        setTotalUsers(data.total);
      })
      .catch(error => {
        console.error('There was an error fetching the users!', error);
      });
  };
  

  useEffect(() => {
    const params = {
      page: currentPage,
      limit: usersPerPage,
      searchTerm,
      filterOption,
      minCreatedRooms,
    };
    fetchUsers(params);
  }, [currentPage, searchTerm, filterOption, minCreatedRooms]);

  const handleDeleteUser = async (username) => {
    setLoading(prevLoading => ({ ...prevLoading, [username]: true }));

    try {
      const response = await fetch(`${apiUrl}/delete/user/${username}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter(user => user.username !== username));
        setTotalUsers(totalUsers - 1);
      } else {
        console.error('Failed to delete the user');
      }
    } catch (error) {
      console.error('There was an error deleting the user!', error);
    } finally {
      setLoading(prevLoading => ({ ...prevLoading, [username]: false }));
    }
  };

  const handleBanUser = async (username) => {
    setLoading(prevLoading => ({ ...prevLoading, [username]: true }));
    try {
      // Bước 1: Xóa người dùng
      await handleDeleteUser(username);
      
      // Bước 2: Cấm người dùng
      const response = await fetch(`${apiUrl}/ban/user/${username}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to ban the user');
      }

      // Người dùng đã được xóa khỏi danh sách bởi handleDeleteUser,
      // nên không cần cập nhật state users ở đây
    } catch (error) {
      console.error('There was an error deleting and banning the user!', error);
      // Có thể thêm xử lý lỗi cụ thể ở đây nếu cần
    } finally {
      setLoading(prevLoading => ({ ...prevLoading, [username]: false }));
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

  const totalPages = Math.ceil(totalUsers / usersPerPage);

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
          <button onClick={() => paginate(currentPage - 1)} className={styles.pageButton}>{t('userManager.previous')}</button>
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
          <button onClick={() => paginate(currentPage + 1)} className={styles.pageButton}>{t('userManager.next')}</button>
        )}
      </div>
    );
  };

  return (
    <div>
      <Navigation />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.heading}>{t('userManager.title')}</h1>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>{t('userManager.userList')}</h3>
              <input
                type="text"
                placeholder={t('userManager.searchPlaceholder')}
                value={searchTerm}
                onChange={handleSearchChange}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.cardBody}>
              <table id={styles.users_table}>
                <thead>
                  <tr>
                    <th>{t('userManager.fullName')}</th>
                    <th>{t('userManager.username')}</th>
                    <th>{t('userManager.joinedRooms')}</th>
                    <th>{t('userManager.createdRooms')}</th>
                    <th>{t('userManager.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.username}>
                      <td>{user.fullname}</td>
                      <td>{user.username}</td>
                      <td>{user.joined_rooms}</td>
                      <td>{user.created_rooms}</td>
                      <td className={styles.action}>
                        <button
                          className={`${styles.button} ${loading[user.username] ? styles.buttonDeleting : ''}`}
                          onClick={() => handleDeleteUser(user.username)}
                          disabled={loading[user.username]}
                        >
                          {loading[user.username] ? t('gameRoomManager.deleting') : t('userManager.delete')}
                        </button>
                        <button
                          className={`${styles.button} ${loading[user.username] ? styles.buttonDeleting : ''}`}
                          onClick={() => handleBanUser(user.username)}
                          disabled={loading[user.username]}
                        >
                          {loading[user.username] ? t('userManager.banning') : t('userManager.ban')}
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
              <h3>{t('userManager.userFilters')}</h3>
            </div>
            <div className={styles.cardBody2}>
              <label>
                <input
                  type="radio"
                  value="all"
                  checked={filterOption === 'all'}
                  onChange={handleFilterChange}
                />
                {t('userManager.allUsers')}
              </label>
              <label>
                <input
                  type="radio"
                  value="over_min"
                  checked={filterOption === 'over_min'}
                  onChange={handleFilterChange}
                />
                {t('userManager.overMinUsers')}
                <input
                  type="number"
                  value={minCreatedRooms}
                  onChange={(e) => setMinCreatedRooms(Number(e.target.value))}
                  style={{ width: '50px', marginLeft: '5px' }}
                /> {t('userManager.createdRoomsSuffix')}
              </label>
              <label>
                <input
                  type="radio"
                  value="inactive"
                  checked={filterOption === 'inactive'}
                  onChange={handleFilterChange}
                />
                {t('userManager.inactiveUsers')}
              </label>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserManager;
