import React, { useEffect } from 'react';
import Plotly from 'plotly.js-dist';
import styles from './Main.module.css';
import { useTranslation } from 'react-i18next';

const Main = () => {
  const { t } = useTranslation();
  const [roomData, setRoomData] = React.useState({});
  const apiUrl = process.env.REACT_APP_API_URL;
  useEffect(() => {
    const fetchDataAndUpdateCharts = () => {
      // Fetch room data from the server
      fetch(`${apiUrl}/admin/room/dashboard`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(t('dashboardAdmin.errorFetchingRoomData', { error: response.statusText }));
          }
          return response.json();
        })
        .then((roomData) => {
          setRoomData(roomData);
          let totalRooms = roomData.total_rooms;
          let emptyRooms = roomData.empty_rooms;
          let privateRooms = roomData.private_rooms;
  
          // Fetch user data from the server
          fetch(`${apiUrl}/admin/user/dashboard`)
            .then((response) => {
              if (!response.ok) {
                throw new Error(t('dashboardAdmin.errorFetchingUserData', { error: response.statusText }));
              }
              return response.json();
            })
            .then((userData) => {
              let totalUsers = userData.total_users;
              let activeUsers = userData.active_users;
  
              // Calculate active rooms
              let activeRooms = totalRooms - emptyRooms - privateRooms;
              // Calculate inactive users
              let inactiveUsers = totalUsers - activeUsers;
  
              // Create the games chart
              let gamesData = [{
                x: [t('dashboardAdmin.activeRooms'), t('dashboardAdmin.emptyRooms'), t('dashboardAdmin.privateRooms')],
                y: [activeRooms, emptyRooms, privateRooms],
                type: 'bar',
                marker: {
                  color: ['#2ca02c', '#1f77b4', '#ff7f0e'] // Colors for each bar
                }
              }];
  
              let gamesLayout = {
                title: `${t('dashboardAdmin.totalRooms', { totalRooms })}`,
                xaxis: {
                  title: t('dashboardAdmin.roomStatus')
                },
                yaxis: {
                  title: t('dashboardAdmin.numberOfRooms')
                }
              };
  
              Plotly.newPlot('game-status-chart', gamesData, gamesLayout);
  
              // Create the users chart
              let usersData = [{
                x: [t('dashboardAdmin.activeUsers'), t('dashboardAdmin.inactiveUsers')],
                y: [activeUsers, inactiveUsers],
                type: 'bar',
                marker: {
                  color: ['#2ca02c', '#1f77b4'] // Colors for each bar
                }
              }];
  
              let usersLayout = {
                title: t('dashboardAdmin.totalUsers', { totalUsers }),
                xaxis: {
                  title: t('dashboardAdmin.userStatus')
                },
                yaxis: {
                  title: t('dashboardAdmin.numberOfUsers')
                }
              };
  
              Plotly.newPlot('users-status-chart', usersData, usersLayout);
            })
            .catch((error) => {
              console.error(t('dashboardAdmin.errorFetchingUserData', { error }));
            });
        })
        .catch((error) => {
          console.error(t('dashboardAdmin.errorFetchingRoomData', { error }));
        });
    }
    fetchDataAndUpdateCharts();
    // Set interval to fetch data periodically
    const intervalId = setInterval(fetchDataAndUpdateCharts, 60000); // 60000 ms = 1 minute
  
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [apiUrl, t]);

  return (
    <main className={styles.mainContent}>
      <div className={styles.container}>
        <div className={`${styles.chartContainer} ${styles.gameStatusChart}`}>
          <h1 className={styles.heading}>{t('dashboardAdmin.roomsStatistics')}</h1>
          <div id="game-status-chart"></div>
        </div>
        <div className={`${styles.chartContainer} ${styles.usersStatusChart}`}>
          <h1 className={styles.heading}>{t('dashboardAdmin.usersStatistics')}</h1>
          <div id="users-status-chart"></div>
        </div>
      </div>
    </main>
  );
};

export default Main;