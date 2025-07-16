// components/UserProfile/UserProfileFormCreator.js
import React, { useState } from 'react';
import styles from './UserProfileCardCreator.module.css';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression'; // Import the library
import Spinner from '../spinner/Spinner';
import useFirebaseUpload from '../../utils/upload'; // Import custom hook

const UserProfileFormCreator = () => {
    const [spinner, setSpinner] = useState(false);
    const [compressing, setCompressing] = useState(false);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;
    const [avatarImage, setAvatarImage] = useState(null);
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [job, setJob] = useState('');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const { userprofile } = useParams();
    const id = localStorage.getItem('id');
    const [socialLinks, setSocialLinks] = useState({
        instagram: '',
        twitter: '',
        linkedin: '',
        facebook: '',
        homepage: '',
    });
    const { uploading, uploadFiles } = useFirebaseUpload();
    const handleImageChange = async (e, setImage) => {
        const file = e.target.files[0];
        if (file) {
            setCompressing(true);
            const config = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
            };
            try {
                const compressedFile = await imageCompression(file, config);
                const webpBlob = await convertToWebP(compressedFile)
                setImage(webpBlob)
            } catch (error) {
                console.error("Error compressing image:", error);
                alert(t('userProfileCardModify.errorCompressingImage'));
                setImage(null);
            }
            finally {
               setCompressing(false);
            }
        }
        else {
            setImage(null)
        }
    };

    const convertToWebP = (blob) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Revoke the old object URL if exists
            const objectURL = URL.createObjectURL(blob);
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                canvas.toBlob((webpBlob) => {
                    if (webpBlob) {
                        resolve(webpBlob);
                    } else {
                        reject(new Error("Conversion to WebP failed"));
                    }
                    // Revoke object URL after processing
                    URL.revokeObjectURL(objectURL);
                }, 'image/webp');
            };

            img.onerror = (error) => {
                reject(error);
                // Revoke URL even if there's an error
                URL.revokeObjectURL(objectURL);
            };

            // Set src to newly created object URL with a timestamp to avoid caching issues
            img.src = `${objectURL}#${new Date().getTime()}`;
        });
    };

    const handleSocialLinksChange = (e) => {
        const { name, value } = e.target;
        setSocialLinks((prevLinks) => ({
            ...prevLinks,
            [name]: value,
        }));
    };

    const uploadAvatar = async () => {
        if (!avatarImage) {
            console.warn("No new avatar image provided.");
            return null;
        }
        try {
            const files = [avatarImage];
            const fileUrls = await uploadFiles(files, userprofile, userprofile);
            return fileUrls[0];
        } catch (error) {
            console.error(t('userProfileCardModify.errorUploadingImages'), error);
            alert(t('userProfileCardModify.errorUploadingImages'));
            return null;
        }
    };

    const uploadBackground = async () => {
        if (!backgroundImage) {
            console.warn("No new background image provided.");
            return null;
        }
        try {
            const files = [backgroundImage];
            const fileUrls = await uploadFiles(files, userprofile, userprofile);
            return fileUrls[0];
        } catch (error) {
            console.error(t('userProfileCardModify.errorUploadingImages'), error);
            alert(t('userProfileCardModify.errorUploadingImages'));
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSpinner(true);

        const avatarUrl = await uploadAvatar();
        const backgroundUrl = await uploadBackground();


        const profileData = {
            username: userprofile,
            avatarImage: avatarUrl,
            backgroundImage: backgroundUrl,
            job,
            description,
            address,
            instagram: socialLinks.instagram,
            twitter: socialLinks.twitter,
            linkedin: socialLinks.linkedin,
            facebook: socialLinks.facebook,
            homepage: socialLinks.homepage,
        };
        const response = await fetch(`${apiUrl}/info/userprofile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(profileData),
        });
        if (response.status === 200) {
            alert('Profile created successfully');
            setSpinner(false);
            navigate(`/profile/${id}`);
        } else {
            setSpinner(false);
            alert('Error creating profile');
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            {spinner && (
                <div className={styles.spinner}>
                    <Spinner />
                </div>
            )}
             {compressing && (
                 <div className={styles.spinner}>
                    <Spinner />
                </div>
            )}
            <div className={styles.formGroup}>
                <label>{t('userProfileCardCreator.uploadAvatar')}</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, setAvatarImage)}
                />
            </div>
            <div className={styles.formGroup}>
                <label>{t('userProfileCardCreator.uploadBackground')}</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, setBackgroundImage)}
                />
            </div>
            <div className={styles.formGroup}>
                <label>{t('userProfileCardCreator.job')}</label>
                <input
                    type="text"
                    value={job}
                    onChange={(e) => setJob(e.target.value)}
                    placeholder={t('userProfileCardCreator.jobPlaceholder')}
                />
            </div>
             <div className={styles.formGroup}>
                <label>{t('userProfileCardCreator.address')}</label>
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={t('userProfileCardCreator.addressPlaceholder')}
                />
            </div>
            <div className={styles.formGroup}>
                <label>{t('userProfileCardCreator.description')}</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('userProfileCardCreator.descriptionPlaceholder')}
                    rows="5"
                />
            </div>
             <div className={styles.formGroup}>
                <label>{t('userProfileCardCreator.socialLinks')}</label>
                <input
                    type="text"
                    name="instagram"
                    value={socialLinks.instagram}
                    onChange={handleSocialLinksChange}
                    placeholder={t('userProfileCardCreator.instagramPlaceholder')}
                />
                <input
                    type="text"
                    name="twitter"
                    value={socialLinks.twitter}
                    onChange={handleSocialLinksChange}
                    placeholder={t('userProfileCardCreator.twitterPlaceholder')}
                />
                <input
                    type="text"
                    name="linkedin"
                    value={socialLinks.linkedin}
                    onChange={handleSocialLinksChange}
                    placeholder={t('userProfileCardCreator.linkedinPlaceholder')}
                />
                <input
                    type="text"
                    name="facebook"
                    value={socialLinks.facebook}
                    onChange={handleSocialLinksChange}
                    placeholder={t('userProfileCardCreator.facebookPlaceholder')}
                />
                <input
                    type="text"
                    name="homepage"
                    value={socialLinks.homepage}
                    onChange={handleSocialLinksChange}
                    placeholder={t('userProfileCardCreator.homepagePlaceholder')}
                />
            </div>

            <button className={styles.submitButton} type="submit">
                {t('userProfileCardCreator.submit')}
            </button>
        </form>
    );
};

export default UserProfileFormCreator;