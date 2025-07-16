import React, { useEffect, useState } from 'react';
import Navigation from '../dashboardadmin/negative'; // Adjust the import based on your project structure
import styles from './ReportManager.module.css'; // Correct the CSS module name
import { useTranslation } from 'react-i18next';
import VisibilityIcon from '@mui/icons-material/Visibility'; // Eye icon for viewing
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb'; // No entry icon for banning
import DeleteIcon from '@mui/icons-material/Delete'; // Delete icon for removing
import Carousel from '../../slideshow/slide';
import CloseIcon from '@mui/icons-material/Close';
const ReportManager = () => {
    const { t } = useTranslation();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUserImages, setSelectedUserImages] = useState([]);
    const [viewImages, setViewImages] = useState(false);
    const apiUrl = process.env.REACT_APP_API_URL;

    async function handleGetReportImages(roomId, userId) {
        const room_id = roomId;

        try {
            const response = await fetch(
                `${apiUrl}/room/host/${room_id}/userimages/${userId}`
            );
            const imagesData = await response.json();
            console.log(imagesData);
            setSelectedUserImages(imagesData);
            setViewImages(true);
        } catch (error) {
            console.error("Error fetching user images:", error);
        }
    }
    const handleCloseCarousel = () => {
        setViewImages(false);
        setSelectedUserImages([]);
    };
    // Fetch reports from the API
    const fetchReports = async () => {
        try {
            const response = await fetch(`${apiUrl}/admin/reports`, {
                method: 'GET', // Use GET method to fetch reports
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token_admin')}` // Include token if needed
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setReports(data.reports); // Assuming the API returns an array of reports
        } catch (error) {
            console.error('There was an error fetching the reports!', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);


    const handleDeleteUser = async (username) => {

        try {
            const response = await fetch(`${apiUrl}/delete/user/${username}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                console.log('User deleted successfully');
            } else {
                console.error('Failed to delete the user');
            }
        } catch (error) {
            console.error('There was an error deleting the user!', error);
        }
    };
    const handleBanUser = async (username) => {
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
            const reportToRemove = reports.find(report => report.username === username);
            if (reportToRemove) {
                await handleRemove(reportToRemove.id)
            }
            setReports(reports.filter(report => report.username !== username));
            console.log('User banned successfully');
        } catch (error) {
            console.error('There was an error deleting and banning the user!', error);
            // Có thể thêm xử lý lỗi cụ thể ở đây nếu cần
        }
    };

    const handleDeleteRoom = async (roomId) => {
        try {
            const response = await fetch(`${apiUrl}/delete/room/${roomId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                const reportToRemove = reports.find(report => report.room_id === roomId);
                if (reportToRemove) {
                    await handleRemove(reportToRemove.id)
                }
                setReports(reports.filter(report => report.room_id !== roomId));
                console.log('Room deleted successfully');
            } else {
                console.error('Failed to delete the room');
            }
        } catch (error) {
            console.error('There was an error deleting the room!', error);
        }
    }

    const handleRemove = async (reportId) => {
        try {
            const response = await fetch(`${apiUrl}/admin/reports/${reportId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token_admin')}` // Include token if needed
                }
            });
            if (!response.ok) {
                throw new Error('Failed to delete the report');
            }
            setReports(reports.filter(report => report.id !== reportId)); // Update state to remove the report
            console.log('Removed report:', reportId);
        } catch (error) {
            console.error('Error removing report:', error);
        }
    };

    if (loading) {
        return <div>Loading reports...</div>; // Loading state
    }

    return (
        <div>
            <Navigation />
            <main className={styles.main}>
                <div className={styles.container}>
                    <h1 className={styles.heading}>{t('reportManager.title')}</h1>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h3>{t('reportManager.reportList')}</h3>
                        </div>
                        <div className={styles.cardBody}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>{t('reportManager.reportID')}</th>
                                        <th>{t('reportManager.reportedUser')}</th>
                                        <th>{t('reportManager.roomId')}</th>
                                        <th>{t('reportManager.reportReason')}</th>
                                        <th>{t('reportManager.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map(report => (
                                        <tr key={report.id}>
                                            <td>{report.id}</td>
                                            <td>
                                                <div>{report.username}</div>
                                                <div>({report.role})</div>
                                            </td>
                                            <td>{report.room_id}</td>
                                            <td>
                                                <div>{t(report.reason)}</div>
                                                <div>{report.additional_info}</div>
                                            </td>
                                            <td>
                                                <button className={styles.button} onClick={() => handleGetReportImages(report.room_id, report.username)} title={t('reportManager.view')}>
                                                    <VisibilityIcon className={styles.icon} />
                                                </button>
                                                <button className={styles.button} onClick={() => handleBanUser(report.username)} title={t('reportManager.ban')}>
                                                    <DoNotDisturbIcon className={styles.icon} />
                                                </button>
                                                {report.role === 'host' && ( // Conditional rendering for handleDeleteRoom button
                                                    <button className={styles.button} onClick={() => handleDeleteRoom(report.room_id)} title={t('reportManager.remove')}>
                                                        <DeleteIcon className={styles.icon} />
                                                    </button>
                                                )}
                                                <button className={styles.button} onClick={() => handleRemove(report.id)} title={t('reportManager.delete')}>
                                                    <CloseIcon className={styles.icon} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                {viewImages && (
                    <div className={styles.carouselContainer}>
                        <button className={styles.closeButton} onClick={handleCloseCarousel} title={t('reportManager.close')}>
                            <CloseIcon />
                        </button>
                        <Carousel data={selectedUserImages} />
                    </div>
                )}
            </main>
        </div>
    );
};

export default ReportManager;
