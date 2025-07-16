// components/UserProfile/UserProfileFormModify.js
import React, { useState, useEffect } from 'react';
import styles from './UserProfileCardCreator.module.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import imageCompression from 'browser-image-compression';
import Spinner from '../spinner/Spinner';
import useFirebaseUpload from '../../utils/upload'; // Import custom hook

const UserProfileFormModify = () => {
    const [spinner, setSpinner] = useState(false);
     const [compressing, setCompressing] = useState(false);
    const { t } = useTranslation();
    const apiUrl = process.env.REACT_APP_API_URL;
    const navigate = useNavigate();
    const { userprofile } = useParams();
    const id = localStorage.getItem('id');
     const [avatarImage, setAvatarImage] = useState(null);
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [job, setJob] = useState('');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [socialLinks, setSocialLinks] = useState({
        instagram: '',
        twitter: '',
        linkedin: '',
        facebook: '',
        homepage: '',
    });
    const [existingAvatarUrl, setExistingAvatarUrl] = useState('');
    const [existingBackgroundUrl, setExistingBackgroundUrl] = useState('');
    const [profileExists, setProfileExists] = useState(true);
     const {  uploadFiles } = useFirebaseUpload();


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
        } else {
            setImage(null);
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
    if (!avatarImage) return existingAvatarUrl; // Return existing if no new avatar

     try {
        const files = [avatarImage];
        const fileUrls = await uploadFiles(files, userprofile, userprofile);
        return fileUrls[0];
      } catch (error) {
         console.error(t('userProfileCardModify.errorUploadingImages'), error);
         alert(t('userProfileCardModify.errorUploadingImages'));
        return existingAvatarUrl;
      }
    };

     const uploadBackground = async () => {
     if (!backgroundImage) return existingBackgroundUrl;

      try {
        const files = [backgroundImage];
        const fileUrls = await uploadFiles(files, userprofile, userprofile);
          return fileUrls[0];
       }
          catch (error) {
         console.error(t('userProfileCardModify.errorUploadingImages'), error);
         alert(t('userProfileCardModify.errorUploadingImages'));
           return existingBackgroundUrl;
        }
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
         setSpinner(true);

        const newAvatarUrl = await uploadAvatar();
        const newBackgroundUrl = await uploadBackground();

         const profileData = {
            avatarImage: newAvatarUrl,
            backgroundImage: newBackgroundUrl,
            job,
            description,
            address,
            instagram: socialLinks.instagram,
            twitter: socialLinks.twitter,
            linkedin: socialLinks.linkedin,
            facebook: socialLinks.facebook,
            homepage: socialLinks.homepage,
        };
        const response = await fetch(`${apiUrl}/modify-profile/${userprofile}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(profileData),
        });
      
        setAvatarImage(null);
        setBackgroundImage(null);
        setJob('');
        setDescription('');
        setAddress('');
        setSocialLinks({
            instagram: '',
            twitter: '',
            linkedin: '',
            facebook: '',
            homepage: '',
        });

        if (response.status === 200) {
            alert(t('userProfileCardModify.profileUpdatedSuccessfully'));
            setSpinner(false);
            window.history.back();
        } else {
            alert(t('userProfileCardModify.errorUpdatingProfile'));
            setSpinner(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(`${apiUrl}/info/userprofile/${id}`);
            const data = await response.json();
            if (response.status === 200) {
                setJob(data.job);
                setDescription(data.description);
                setAddress(data.address);
                setSocialLinks({
                    instagram: data.instagram,
                    twitter: data.twitter,
                    linkedin: data.linkedin,
                    facebook: data.facebook,
                    homepage: data.homepage
                });
                setExistingAvatarUrl(data.avatarImage);
                setExistingBackgroundUrl(data.backgroundImage);
            } else {
                setProfileExists(false);
            }
        };
        fetchData();
    }, [userprofile, apiUrl, id]);

    if (!profileExists) {
        return (
            <div className={styles.noProfile}>
                <p>{t('userProfileCardModify.noProfile')}</p>
                <button onClick={() => navigate(`/generator/${userprofile}`)}>{t('userProfileCardModify.createProfile')}</button>
            </div>
        );
    }

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
                <label>{t('userProfileCardModify.uploadAvatar')}</label>
                <input
                    type="file"
                    accept="image/*"
                   onChange={(e) => handleImageChange(e, setAvatarImage)}
                />
            </div>

            <div className={styles.formGroup}>
                <label>{t('userProfileCardModify.uploadBackground')}</label>
                <input
                    type="file"
                    accept="image/*"
                   onChange={(e) => handleImageChange(e, setBackgroundImage)}
                />
            </div>

            <div className={styles.formGroup}>
                <label>{t('userProfileCardModify.job')}</label>
                <input
                    type="text"
                    value={job}
                    onChange={(e) => setJob(e.target.value)}
                    placeholder={t('userProfileCardModify.jobPlaceholder')}
                />
            </div>

            <div className={styles.formGroup}>
                <label>{t('userProfileCardModify.address')}</label>
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={t('userProfileCardModify.addressPlaceholder')}
                />
            </div>

            <div className={styles.formGroup}>
                <label>{t('userProfileCardModify.description')}</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('userProfileCardModify.descriptionPlaceholder')}
                    rows="5"
                />
            </div>

            <div className={styles.formGroup}>
                <label>{t('userProfileCardModify.socialLinks')}</label>
                <input
                    type="text"
                    name="instagram"
                    value={socialLinks.instagram}
                    onChange={handleSocialLinksChange}
                    placeholder={t('userProfileCardModify.instagramPlaceholder')}
                />
                <input
                    type="text"
                    name="twitter"
                    value={socialLinks.twitter}
                    onChange={handleSocialLinksChange}
                    placeholder={t('userProfileCardModify.twitterPlaceholder')}
                />
                <input
                    type="text"
                    name="linkedin"
                    value={socialLinks.linkedin}
                    onChange={handleSocialLinksChange}
                    placeholder={t('userProfileCardModify.linkedinPlaceholder')}
                />
                <input
                    type="text"
                    name="facebook"
                    value={socialLinks.facebook}
                    onChange={handleSocialLinksChange}
                    placeholder={t('userProfileCardModify.facebookPlaceholder')}
                />
                <input
                    type="text"
                    name="homepage"
                    value={socialLinks.homepage}
                    onChange={handleSocialLinksChange}
                    placeholder={t('userProfileCardModify.homepagePlaceholder')}
                />
            </div>

            <button className={styles.submitButton} type="submit">
                {t('userProfileCardModify.submit')}
            </button>
        </form>
    );
};

export default UserProfileFormModify;