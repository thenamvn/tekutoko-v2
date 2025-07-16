// Room.js
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import QRCode from "qrcode.react";
import { useTranslation } from "react-i18next";
import imageCompression from "browser-image-compression";
// import useIsMobile from "../../utils/useIsMobile"; // Import the hook
// import NavigationBarDesktop from "../NavigationBar/NavigationBarDesktop";
import useFirebaseUpload from "../../utils/upload"; // Import the upload function
import PostAddIcon from "@mui/icons-material/PostAdd";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import AddTaskIcon from "@mui/icons-material/AddTask";
import Carousel from "../slideshow/slide";
import PrizePopup from "./popup/Reward";
import RewardForm from "./rewardForm/RewardForm";
import DenyForm from "./popup/DenyForm";
// Import the necessary icons
import SettingsIcon from "@mui/icons-material/Settings";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import DeleteIcon from "@mui/icons-material/Delete";
import LogoutIcon from "@mui/icons-material/Logout";
import ShareIcon from "@mui/icons-material/Share";
import GroupsIcon from "@mui/icons-material/Groups";
import WarningIcon from "@mui/icons-material/Warning";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Link } from "react-router-dom";
// set reward
import SetVoucher from "../setupVoucher/setupVoucher";
import NavigationComponent from "../NavigationBar/NavigationBar";
import Spinner from "../spinner/Spinner";
import NotFound from "../404/404";
//report
import ReportForm from "../report/ReportForm";
import verifyToken from "../../utils/verify";
// text translation
import { translateText } from "../../utils/AutoTranslate";
const Room = () => {
  const laguage = localStorage.getItem("language");
  const [notFoundRoom, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [spinner, setUploading] = useState(false);
  const { t } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  // const [files, setFiles] = useState([]);
  const [ShowImages, setShowImages] = useState(true);
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const [showUploadFormUser, setShowUploadFormUser] = useState(false);
  // Add state variables for the room details, admin status, error, job descriptions, and other necessary data
  const [roomDetails, setRoomDetails] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);
  const [jobDescriptions, setJobDescriptions] = useState("");
  const [showUploadFormAdmin, setShowUploadFormAdmin] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showSubmitedForm, setShowSubmitedForm] = useState(false);
  const [submittedUsers, setSubmittedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedUserFullName, setSelectedUserFullName] = useState("");
  const [selectedUserImages, setSelectedUserImages] = useState([]);

  const [showRewardForm, setShowRewardForm] = useState(false);
  const [showSettingForm, setShowSettingForm] = useState(false);
  const [showSettingFormUser, setShowSettingFormUser] = useState(false);
  const [showReportFormForUser, setShowReportFormForUser] = useState(false);
  const [showReportFormForAdmin, setShowReportFormForAdmin] = useState(false);
  const [members, setMembers] = useState(0);

  // New state variables for the provided information
  const [roomId, setRoomId] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [roomTitle, setRoomTitle] = useState("");
  const [showRoomTitle, setShowRoomTitle] = useState(true);
  const [HostImages, setHostImages] = useState([]);
  const [showPhotoLibrary, setShowPhotoLibrary] = useState(false);
  const [UserImages, setUserImages] = useState([]);
  const [HostID, setHostID] = useState("");
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  //consst discount, tiket
  const [listVoucher, setListVoucher] = useState([]);
  const [listTicket, setListTicket] = useState([]);
  const [showRewardInfo, setShowRewardInfo] = useState(false);
  //state for set reward
  const [showSetReward, setShowSetReward] = useState(false);

  // const isMobile = useIsMobile(); // Use the hook
  // room type 
  const [roomType, setRoomType] = useState("");
  const { uploading, error: uploadError, uploadFiles } = useFirebaseUpload();
  const handlecloseSetReward = () => {
    setShowSetReward(false);
  };

  const closeRewardInfo = () => {
    setShowRewardInfo(false);
  };

  const fetchVoucherInfo = async () => {
    try {
      const response = await fetch(`${apiUrl}/get/vouchers/room/${id}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const rewardInfo = await response.json();
      if (Array.isArray(rewardInfo)) {
        const discountVouchers = rewardInfo.filter(
          (voucher) => voucher.reward_type === "discount"
        );
        const ticketVouchers = rewardInfo.filter(
          (voucher) => voucher.reward_type === "ticket"
        );
        setListTicket(ticketVouchers);
        setListVoucher(discountVouchers);
      } else {
        setListTicket([]);
        setListVoucher([]);
      }
    } catch (error) {
      console.error("Error fetching reward information:", error);
      setListTicket([]);
      setListVoucher([]);
    }
  };

  const handleUpdateRoomTitle = async () => {
    try {
      const response = await fetch(`${apiUrl}/host/room/update-title/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          room_title: roomTitle,
          username: adminUsername,
        }),
      });

      if (response.ok) {
        setRoomDetails((prevDetails) => ({
          ...prevDetails,
          room_title: roomTitle,
        }));
        // Optionally, you can update the state or show a success message
      } else {
        const errorData = await response.json();
        console.error("Error updating room title:", errorData);
        // Optionally, you can show an error message to the user
      }
    } catch (error) {
      console.error("Error updating room title:", error);
      // Optionally, you can show an error message to the user
    }
  };

  // Hàm kiểm tra và hiển thị form upload
  const handleUploadClickAdmin = async () => {
    const isLogged = await verifyToken();
    if (!isLogged) {
      localStorage.setItem("redirectPath", location.pathname);
      navigate("/login");
    }
    setShowUploadFormAdmin(true); // Hiển thị form upload nếu đã đăng nhập
  };

  const handleUploadClickUser = async () => {
    const isLogged = await verifyToken();
    if (!isLogged) {
      localStorage.setItem("redirectPath", location.pathname);
      navigate("/login");
    }
    setShowUploadFormUser(true); // Hiển thị form upload nếu đã đăng nhập
  };

  // Function to fetch the updated list of submitted users
  const fetchSubmittedUsers = async () => {
    try {
      // const response = await fetch(`${apiUrl}/room/${id}/submited`);
      const response = await fetch(`${apiUrl}/room/${id}/submited`);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      setSubmittedUsers(Array.isArray(data) ? data : []); // Ensure it's an array
    } catch (error) {
      console.error("Error fetching submitted users:", error);
    }
  };
  //Fetch room images
  const fetchRoomImages = async () => {
    try {
      const response = await fetch(`${apiUrl}/room/${id}/images`);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      setHostImages(data);
    } catch (error) {
      console.error("Error fetching room images:", error);
    }
  };

  const fetchUserImages = async () => {
    try {
      const response = await fetch(
        `${apiUrl}/room/${id}/userimages/${localStorage.getItem("username")}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      setUserImages(data);
      return data;
    } catch (error) {
      console.error("Error fetching user images:", error);
      return [];
    }
  };

  const fetchRoomDetailsAndResources = async () => {
    try {
      // Fetch room details
      const response = await fetch(`${apiUrl}/room/${id}/info`);
      if (!response.ok) {
        if (response.status === 404) {
          setNotFound(true);
          return;
        }
        const errorText = await response.text();
        throw new Error(
          `Network response was not ok: ${response.status} - ${errorText}`
        );
      }
      const data = await response.json();
      setHostID(data.id);
      setRoomDetails(data);
      setRoomId(data.room_id);
      const translatedRoomTitle = await translateText(data.room_title || data.room_id, laguage);
      setRoomTitle(translatedRoomTitle);
      setAdminUsername(data.admin_username);
      setFullName(data.fullname);
      setRoomType(data.room_type);
      const Admin = data.admin_username === localStorage.getItem("username");
      setIsAdmin(Admin);
      // If admin, fetch submitted users
      if (Admin) {
        fetchRoomMembers();
        fetchSubmittedUsers();
        fetchRoomImages();
        fetchVoucherInfo();
        try {
          const jobsResponse = await fetch(`${apiUrl}/room/${id}/jobs`);
          const jobsData = await jobsResponse.json();
          setJobDescriptions(jobsData[0].job_description);
        } catch (error) {
          console.error("Error fetching room members:", error);
        }
      }

      // Trong hàm xử lý chính
      if (!Admin) {
        fetchRoomMembers();
        fetchUserImages();
        fetchVoucherInfo();
        fetchRoomImages(); // Gọi hàm fetchRoomImages
        try {
          // Fetch room jobs
          const jobsResponse = await fetch(`${apiUrl}/room/${id}/jobs`);
          if (!jobsResponse.ok) {
            throw new Error(`Error fetching jobs: ${jobsResponse.statusText}`);
          }
          const jobsData = await jobsResponse.json();
          if (Array.isArray(jobsData) && jobsData.length > 0) {
            const translatedJobDescriptions = await translateText(jobsData[0].job_description, laguage);
            setJobDescriptions(translatedJobDescriptions);
          } else {
            setJobDescriptions(""); // Set to an empty string or handle as needed
          }
        
          // Join room
          const joinRoomResponse = await fetch(`${apiUrl}/joinroom`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              id: id,
              username: localStorage.getItem("username"),
            }),
          });
          if (!joinRoomResponse.ok) {
            throw new Error(`Error joining room: ${joinRoomResponse.statusText}`);
          }
          const joinRoomData = await joinRoomResponse.json();
          console.log("Join room response:", joinRoomData);
        } catch (error) {
          console.error("There was an error during the process:", error);
        }
      }
    } catch (error) {
      console.error("Error fetching room details or resources:", error);
      setError(error.message);
    }
  };
  const handlePhotoLibrary = async () => {
    await fetchUserImages();
    try {
      const jobsResponse = await fetch(`${apiUrl}/room/${id}/jobs`);
      const jobsData = await jobsResponse.json();
      setJobDescriptions(jobsData[0].job_description);
    } catch (error) {
      console.error("Error fetching room images:", error);
    }

    setShowPhotoLibrary(true);
    setShowImages(false);
  };

  const fetchRoomMembers = async () => {
    try {
      const response = await fetch(`${apiUrl}/room/${id}/members`);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      setMembers(data.members);
    } catch (error) {
      console.error("Error fetching room members:", error);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true); // Bắt đầu tải
      try {
        await fetchRoomDetailsAndResources();
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // Kết thúc tải, dù thành công hay lỗi
      }
    };

    fetchAllData();
  }, [id]);


  function closeMissionUpload() {
    setShowUploadFormAdmin(false);
    setSelectedFiles([]);
  }

  function UserShowUploadForm() {
    setShowUploadFormUser(false);
    setSelectedFiles([]);
    setShowImages(true);
  }

  function UserShowUploadFormAndHiddenImages() {
    handleUploadClickUser();
    setShowImages(false);
  }

  function handleAccept() {
    setShowRoomTitle(true);
    setShowSubmitedForm(false);
    setShowRewardForm(true);
  }

  function handleCloseSubmitedImages() {
    setShowRewardForm(false);
  }

  const handleDeleteRoom = async () => {
    setUploading(true);
    try {
      const username = localStorage.getItem("username");
      const response = await fetch(
        `${apiUrl}/user/delete/room/${id}/${username}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.ok) {
        alert(t("alert.room.deleteSuccess"));
        navigate("/dashboard");
      } else {
        console.error("Failed to delete the room");
      }
    } catch (error) {
      console.error("There was an error deleting the room!", error);
    } finally {
      setUploading(false);
    }
  };

  const handleShowRewardInfo = async () => {
    await fetchVoucherInfo();
    setShowRewardInfo(true);
  };

  const handleLeaveRoom = async () => {
    setUploading(true);
    try {
      const username = localStorage.getItem("username");
      const response = await fetch(
        `${apiUrl}/user/leave/room/${id}/${username}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.ok) {
        alert(t("alert.room.leaveSuccess"));
        navigate("/dashboard");
      } else {
        console.error("Failed to leave the room");
      }
    } catch (error) {
      console.error("There was an error leaving the room!", error);
    } finally {
      setUploading(false);
    }
  };

  function handleDeny(username) {
    console.log("Denying user:", username, "in room:", id);
    setUploading(true);
    // First fetch to deny the job
    fetch(`${apiUrl}/denyjob`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        room_id: id,
        username: username,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          console.error("Network response was not ok:", response.statusText);
        }
        return response.json();
      })
      .catch((error) => {
        console.error("Error denying job:", error);
        setUploading(false);
      });

    // Second fetch to deny the user
    fetch(`${apiUrl}/deny/user/${username}/room/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        // Update the state immediately
        setSubmittedUsers((prevUsers) =>
          prevUsers.filter((user) => user.username !== username)
        );
        setShowSubmitedForm(false);
        setShowRoomTitle(true);
        // Send email asynchronously
        if (
          username &&
          username.length === 33 &&
          username.startsWith("U") &&
          !username.includes("@gmail.com")
        ) {
          sendMessageToLine(
            username,
            `${t("room.submissionDenied")} ${t("room.checkRequirements")}`
          );
        } else {
          sendEmailToUser(username);
        }
        setUploading(false);
      })
      .catch((error) => {
        console.error("There was an error denying the user!", error);
        setUploading(false);
      });
  }

  const handleDeleteUserSubmited = async (roomId, username) => {
    try {
      const response = await fetch(
        `${apiUrl}/host/delete/submiteduser/${roomId}/${username}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      // Update the local state to remove the user
      setSubmittedUsers((prevUsers) =>
        prevUsers.filter((user) => user.username !== username)
      );

      console.log("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  async function handleReportForAdmin(username) {
    try {
      // Gọi hàm xóa người dùng đã nộp
      await handleDeleteUserSubmited(id, username);
      console.log(`User ${username} has been reported successfully.`);
      setShowSubmitedForm(false);
    } catch (error) {
      console.error("Error reporting user:", error);
      alert(t("alert.report.reportFailed"));
    }
  }

  function sendEmailToUser(username) {
    fetch(`${apiUrl}/sendemail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: username, // Replace with the actual user email
        subject: `${t("room.roomTitle")} ${roomTitle ? `${roomTitle} - (${roomId})` : roomId
          } - ${t("room.host")}: ${fullName}`,
        text: `${t("room.submissionDenied")} ${t("room.checkRequirements")}`,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Email sent successfully:", data);
      })
      .catch((error) => {
        console.error("Error sending email:", error);
      });
  }

  async function handleUserClick(userId, fullname) {
    const room_id = id;

    try {
      const response = await fetch(
        `${apiUrl}/room/host/${room_id}/userimages/${userId}`
      );
      const imagesData = await response.json();
      setSelectedUserImages(imagesData);
      setSelectedUser(userId);
      setSelectedUserFullName(fullname);
      setShowRoomTitle(false);
      setShowSubmitedForm(true);
    } catch (error) {
      console.error("Error fetching user images:", error);
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    setShowTooltip(true);
    setTimeout(() => {
      setShowTooltip(false);
    }, 1000);
  }

  // Function to convert image blob to WebP format
  const convertToWebP = (blob) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

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
        }, "image/webp");
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  };

  async function checkIfUserRewarded(room_id, username) {
    const response = await fetch(
      `${apiUrl}/rewarded_users/check?room_id=${room_id}&username=${username}`
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.isRewarded;
  }

  // handleChange chỉ lưu files vào state
  function handleChange(event) {
    const filesArray = Array.from(event.target.files);
    let maxLimit;

    if (isAdmin) {
      maxLimit = 5;
    } else {
      maxLimit = HostImages.length + 3;
    }

    if (filesArray.length > maxLimit) {
      alert(t("alert.limitUpload", { limit: maxLimit }));
      return;
    }

    setSelectedFiles(filesArray);
  }

  // handleSubmit xử lý nén, chuyển đổi và upload
  async function handleSubmit(event) {
    event.preventDefault();
    if (!selectedFiles.length) {
      return;
    }
    setUploading(true);
    const username = localStorage.getItem("username");
    const current_username = localStorage.getItem("current_username");

    try {
      const isRewarded = await checkIfUserRewarded(id, username);
      if (isRewarded) {
        alert(t("room.rewarded"));
        return;
      }

      const config = {
        maxSizeMB: 1, // Giới hạn dung lượng 1 MB
        maxWidthOrHeight: 1920, // Giới hạn độ phân giải Full HD
        useWebWorker: true,
      };

      // Nén và chuyển đổi file
      const webpImages = await Promise.all(
        selectedFiles.map(
          (file) =>
            imageCompression(file, config) // Nén ảnh
              .then((compressedBlob) => convertToWebP(compressedBlob)) // Chuyển đổi sang WebP
        )
      );

      const convertedFiles = webpImages.map((blob, i) => new File([blob], selectedFiles[i].name.replace(/\.[^/.]+$/, "") + ".webp", { type: 'image/webp' }));
      const formData = new FormData();
      const fileUrls = await uploadFiles(convertedFiles, id, username);
      console.log("File URLs:", fileUrls);

      if (isAdmin) {
        // Check if the admin has a job description
        const jobCheckResponse = await fetch(
          `${apiUrl}/check_job/${id}/${adminUsername}`
        );
        const jobCheckData = await jobCheckResponse.json();
        if (jobCheckData.hasJob) {
          // Delete old job
          const deleteJobResponse = await fetch(`${apiUrl}/delete_job/${id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ username: adminUsername }),
          });
          if (!deleteJobResponse.ok) throw new Error("Failed to delete job");
        }

        // Delete old images if exist
        if (HostImages.length > 0) {
          const deleteImagesResponse = await fetch(
            `${apiUrl}/delete_images/${id}/${adminUsername}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({ username: adminUsername }),
            }
          );
          if (!deleteImagesResponse.ok)
            throw new Error("Failed to delete images");
        }

        // Upload new job description
        const jobDescription = document.getElementById("jobDescription").value;
        const job = {
          room_id: id,
          job: jobDescription,
          job_owner: adminUsername,
        };
        const response = await fetch(`${apiUrl}/upload_job`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(job),
        });
        if (!response.ok) throw new Error("Failed to upload job");

        // Save file URLs in the database
        const responseImage = await fetch(`${apiUrl}/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            room_id: id,
            uploader_username: username,
            fileUrls: fileUrls,
          }),
        });
        if (!responseImage.ok) throw new Error("Failed to upload image");
        await fetchRoomImages();
        handleUpdateRoomTitle();
        setShowUploadFormAdmin(false);
        setSelectedFiles([]);
        alert(t("room.jobUpload"));
      } else {
        const userimages = await fetchUserImages();
        const x = userimages.length + selectedFiles.length;
        console.log("x", x);
        const limit = HostImages.length + 3;

        if (x > limit) {
          alert(t("alert.limitUpload", { limit }));
          setSelectedFiles([]);
          return;
        }

        if (x < HostImages.length) {
          console.log("Preparing to upload new files...");
          const responseImage = await fetch(`${apiUrl}/upload`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              room_id: id,
              uploader_username: username,
              fileUrls: fileUrls,
            }),
          });
          if (!responseImage.ok) throw new Error("Failed to upload image");
          setShowUploadFormUser(false);
          setShowImages(true);
          setSelectedFiles([]);
          console.log("Uploaded new files successfully!");
        }
        if (x >= HostImages.length && x < limit) {
          // Save file URLs in the database
          const responseImage = await fetch(`${apiUrl}/upload`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              room_id: id,
              uploader_username: username,
              fileUrls: fileUrls,
            }),
          });
          if (!responseImage.ok) throw new Error("Failed to upload image");
          const response = await fetch(`${apiUrl}/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, username }),
          });
          const data = await response.json();
          const userimages = await fetchUserImages();
          if (
            adminUsername &&
            adminUsername.startsWith("U") &&
            adminUsername.length === 33 &&
            !adminUsername.includes("@gmail.com")
          ) {
            sendMessageToLine(
              adminUsername,
              `${t("room.userCompleted")} ${current_username} ${t(
                "room.sentResult"
              )} ${t("room.checkResult")}`
            );
          } else {
            sendEmailToAdmin(current_username);
          }
          alert(t("room.submitted"));
          setShowUploadFormUser(false);
          setSelectedFiles([]);
          setShowImages(true);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert(`Error: ${error.message}`);
      setSelectedFiles([]);
    } finally {
      setUploading(false);
      setSelectedFiles([]);
    }
  }

  const sendMessageToLine = async (userId, message) => {
    if (!userId || !message) {
      throw new Error("id và messages là bắt buộc");
    }

    try {
      const response = await fetch(`${apiUrl}/send-message-line`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: userId,
          messages: message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json(); // Get error details from response
        throw new Error(`Error: ${errorData.error || response.statusText}`);
      }

      const data = await response.json(); // Lấy dữ liệu phản hồi từ API
      return data; // Trả về dữ liệu phản hồi
    } catch (error) {
      console.error("Error sending message to Line:", error);
      throw new Error("Đã xảy ra lỗi khi gửi tin nhắn");
    }
  };

  function sendEmailToAdmin(current_username) {
    fetch(`${apiUrl}/sendemail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: adminUsername, // Replace with the actual admin email
        subject: `${t("room.roomTitle")} ${roomTitle ? `${roomTitle} - (${roomId})` : roomId
          } - ${t("room.host")}: ${fullName}`,
        text: `${t("room.userCompleted")} ${current_username} ${t(
          "room.sentResult"
        )} ${t("room.checkResult")}`,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Email sent successfully:", data);
      })
      .catch((error) => {
        console.error("Error sending email:", error);
      });
  }

  const formatJobDescriptions = (text) => {
    // Chia đoạn text thành mảng các dòng
    const lines = text.split("\n");
    // Chuyển đổi mảng thành chuỗi HTML với các thẻ <p>
    return lines.map((line) => `<p>${line}</p>`).join("");
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (notFoundRoom) {
    return <NotFound />;
  }

  if (loading || !roomDetails) {
    return <Spinner />;
  }

  const renderMobileLayout = () => (
    <div className="flex flex-col h-screen bg-gray-100">
      {spinner && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-opacity-50 bg-gray-100 z-9999">
          <Spinner />
        </div>
      )}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-20">
        <div className="container mx-auto px-4 py-8">
          {isAdmin ? (
            <>
              {/* Admin view */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  <button
                      className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-200"
                    onClick={() => setShowRoomInfo(true)}
                  >
                    <ShareIcon />
                  </button>
                   <button
                    className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-200"
                      onClick={() => {
                       handlePhotoLibrary();
                     }}
                   >
                    <PhotoLibraryIcon />
                  </button>
               </div>
                <div className="flex items-center gap-2">
                    <GroupsIcon />
                  <span>{members} {t("room.members")}</span>
                    <button
                        className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-200"
                      onClick={() => setShowSettingForm(true)}
                     >
                      <SettingsIcon />
                  </button>
                </div>
               </div>
              {showRoomTitle && (
                <div className="mb-4">
                  <h1 className="text-2xl font-semibold text-gray-800 text-center">
                    {t("room.roomTitle")}{" "}
                    {roomTitle}
                  </h1>
                </div>
              )}
              {/* Leaderboard */}
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-800 text-center">
                  {t("room.membersCompleted")}
                </h2>
                <div className="overflow-x-auto">
                  <ul className="flex whitespace-nowrap">
                    {submittedUsers.map((user, index) => (
                      <li
                        key={index}
                        onClick={() =>
                          handleUserClick(user.username, user.fullname)
                        }
                          className="bg-white p-2 rounded-md text-center text-gray-700 hover:bg-gray-200 transition-colors duration-200 cursor-pointer mr-2"
                      >
                        {user.fullname}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <button
                className="p-2 bg-blue-500 hover:bg-blue-700 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 absolute bottom-20 right-5 z-1000"
                onClick={handleUploadClickAdmin}
              >
                <PostAddIcon />
              </button>
              {showRoomInfo && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-md p-6 relative max-w-md">
                    <button
                      className="absolute top-2 right-2 text-gray-700 hover:text-gray-900 cursor-pointer text-2xl"
                      onClick={() => setShowRoomInfo(false)}
                    >
                      X
                    </button>
                    <h2 className="text-xl font-bold mb-4 text-center">Room ID: {id}</h2>
                    <p className="mb-2 text-gray-700 text-center">
                     {t("room.roomLink")}: <a href={window.location.href} className="text-blue-500 underline">{window.location.href}</a>
                     <br />{t("room.scanQRCode")}
                    </p>
                    <div className="flex justify-center mb-4">
                      <QRCode value={window.location.href} size={200} />
                    </div>
                    <button
                      className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 block mx-auto"
                      onClick={() => copyToClipboard(window.location.href)}
                    >
                      {t("room.copyLink")}
                    </button>
                    {showTooltip && (
                      <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md mt-2 block mx-auto">
                        {t("room.copiedToClipboard")}
                      </span>
                    )}
                  </div>
                </div>
              )}
              {showSetReward && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-1000">
                   <SetVoucher
                     onClose={handlecloseSetReward}
                     roomId={id}
                     hostId={adminUsername}
                     listTicket={listTicket}
                     listVoucher={listVoucher}
                     setListTicket={setListTicket}
                      setListVoucher={setListVoucher}
                      />
                </div>
             )}
              {showReportFormForAdmin && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-1000">
                 <div className="p-6 relative max-w-md">
                     <ReportForm
                        handleReportForAdmin={() =>
                         handleReportForAdmin(selectedUser)
                         }
                          onClose={() => setShowReportFormForAdmin(false)}
                          roomId={id}
                          username={selectedUser}
                     />
                   </div>
               </div>
              )}
              {showUploadFormAdmin && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <form className="bg-white rounded-md p-6 relative max-w-md" onSubmit={handleSubmit}>
                      <h2 className="text-xl font-semibold mb-4 text-center">{t("room.missionUpload")}</h2>
                      <h3 className="text-lg text-gray-700 mb-2">{t("room.titleUpload")}</h3>
                      <input
                          type="text"
                          value={roomTitle}
                          onChange={(e) => setRoomTitle(e.target.value)}
                          placeholder={t("room.enterNewRoomTitle")}
                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                     />
                     <button
                      className="absolute top-2 right-2 text-gray-700 hover:text-gray-900 cursor-pointer text-2xl"
                      onClick={closeMissionUpload}
                    >
                      <CloseIcon />
                   </button>
                      <div className="mt-4 flex items-center justify-center">
                      <label
                        htmlFor="fileInput"
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md cursor-pointer inline-block"
                      >
                            <i className="fas fa-upload"></i> {t("room.selectFiles")}
                          </label>
                       <input
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                          className="hidden"
                           multiple
                          id="fileInput"
                        />
                    {selectedFiles.length > 0 && (
                      <div className="text-gray-700 mt-2">
                          {selectedFiles.length} {t("room.filesSelected")}
                      </div>
                  )}
                    {HostImages.length > 0 && (
                        <p className="text-red-500 mt-2">
                          {t("room.oldimageswillbedelete")}
                        </p>
                     )}
                    </div>
                       <h3 className="text-lg text-gray-700 mt-4 mb-2">{t("room.description")}</h3>
                      <textarea
                          id="jobDescription"
                          value={jobDescriptions}
                          placeholder={t("room.description")}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-2 h-32"
                          onChange={(e) => setJobDescriptions(e.target.value)}
                      />
                  <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 block mx-auto mt-4">
                          {t("room.submit")}
                       <SendIcon className="ml-2 align-middle" />
                     </button>
               </form>
           </div>
        )}
  
                {showSettingForm && (
                  <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-md p-6 relative max-w-md">
                         <button
                           className="absolute top-2 right-2 text-gray-700 hover:text-gray-900 cursor-pointer text-2xl"
                            onClick={() => setShowSettingForm(false)}
                           >
                             X
                          </button>
                          <h2 className="text-xl font-semibold mb-4 text-center">{t("room.settings")}</h2>
                          <div className="flex flex-col gap-4">
                              <div className="flex flex-col gap-2">
                                 <button
                                      className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 block mx-auto"
                                         onClick={() => setShowSetReward(true)}
                                  >
                                        {t("room.setReward")}
                                 </button>
                                <button
                                        className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 block mx-auto"
                                        onClick={handleShowRewardInfo}
                                    >
                                       {t("room.rewardInfo")}
                                    </button>
                            </div>
                             <div className="flex items-center justify-between">
                                  <p>{roomType === "public" ? t("room.setToPrivate") : t("room.setToPublic")}</p>
                                   <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={roomType === "private"}
                                          onChange={async () => {
                                            const newRoomType = roomType === "public" ? "private" : "public";
                                            setRoomType(newRoomType);
                                            // Prepare the request body
                                            const requestBody = {
                                              room_type: newRoomType,
                                              admin_username: localStorage.getItem("username") // Get the admin username from local storage
                                            };
  
                                            // Update the room type on the server
                                            await fetch(`${apiUrl}/room/${id}/update-type`, {
                                                method: "PUT",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                   Authorization: `Bearer ${localStorage.getItem("token")}`,
                                                },
                                                 body: JSON.stringify(requestBody), // Send the updated body
                                          });
                                     }}
                                        className="sr-only peer"
                                     />
                                     <span className="ml-3 w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></span>
                                    </label>
                                </div>
                               <button
                                 className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 block mx-auto"
                                 onClick={handleDeleteRoom}
                              >
                                  <DeleteIcon className="align-middle mr-2"/>
                                  <span>{t("room.deleteRoom")}</span>
                                </button>
                            </div>
                         </div>
                      </div>
               )}
                 {showRewardInfo && (
                  <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-md p-6 relative max-h-[90vh] overflow-y-auto scrollbar-hide">
                      <h2 className="text-xl font-bold mb-4 text-center">
                        {t("room.rewardsYouCanGet")}
                      </h2>
                      <div className="flex flex-col gap-4">
                        {listVoucher.map((rewardInfo) => (
                          <div key={rewardInfo.voucher_id} className="bg-white rounded-md shadow-md p-4  w-full max-w-md">
                              <div className="flex  items-center border-b border-gray-200 pb-4 mb-2">
                                   <div className="w-16 h-16 mr-4 overflow-hidden rounded-full">
                                       <img src={rewardInfo.host_avatar_url} alt="coupon" className="w-full h-full object-cover" />
                                  </div>
                                 <div className="flex-1">
                                      <h2 className="text-lg font-semibold text-gray-800">{rewardInfo.discount_name}</h2>
                                  </div>
                              </div>
                             <div className="flex items-center justify-between mt-4">
                                   <span className="font-bold">
                                         <span className="text-2xl text-blue-600">{rewardInfo.discount_value}</span> {t("reward.coupon")}
                                     </span>
                                  </div>
                                     <p className="text-gray-600 text-sm mt-2">{t('couponCard.validTill')} {new Date(rewardInfo.expiration_date).toLocaleDateString()}</p>
                               <textarea className="mt-2 border p-2 rounded-md w-full h-20 text-sm text-gray-700 bg-gray-100" readOnly value={rewardInfo.discount_description} />
                          </div>
                        ))}
                        {listTicket.map((rewardInfo) => (
                         <div key={rewardInfo.voucher_id}  className="bg-white rounded-md shadow-md p-4  w-full max-w-md">
                             <div className="flex items-center justify-center border-b border-gray-200 pb-4 mb-2">
                                   <div className="w-64 h-64">
                                    <img src={rewardInfo.ticket_image_url} alt="ticket" className="w-full h-full object-cover" />
                                   </div>
                                 </div>
                             <div className="flex flex-col gap-4">
                                <h2 className="text-lg font-semibold text-gray-800 text-center">{rewardInfo.ticket_name}</h2>
                                 <p className="text-gray-600 text-center mt-2">{rewardInfo.ticket_description}</p>
                             </div>
                           <input
                                 className="bg-gray-100 border border-gray-300 mt-4 py-2 px-4 rounded-md w-full text-center"
                               readOnly
                                   value={`${t("reward.validTill")}: ${new Date(
                                          rewardInfo.expiration_date
                                      ).toLocaleDateString()}`}
                               />
                         </div>
                        ))}
                      </div>
                        <button
                      className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 block mx-auto mt-4"
                        onClick={closeRewardInfo}
                       >
                           {t("room.close")}
                        </button>
                    </div>
               </div>
             )}
  
                {showRewardForm && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
                     <RewardForm
                       username={selectedUser}
                        room_id={id}
                       onClose={handleCloseSubmitedImages}
                       onUpdateLeaderboard={fetchSubmittedUsers}
                      room_title={roomTitle}
                      />
                 </div>
                )}
  
                {showPhotoLibrary && (
                  <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-md p-6 relative max-h-[90vh] overflow-y-auto w-full max-w-md scrollbar-hide">
                         <button
                             className="absolute top-2 right-2 text-gray-700 hover:text-gray-900 cursor-pointer text-2xl"
                             onClick={() => setShowPhotoLibrary(false)}
                         >
                          X
                          </button>
                        <h1 className="text-xl font-bold mb-4 text-center">{t("room.myEvent")}</h1>
                         <div className="flex flex-col">
                           <div className="mb-4">
                              <h2 className="text-lg text-center font-semibold text-gray-800">
                                  {t("room.mission")}
                              </h2>
                                {jobDescriptions ? (
                                 <div dangerouslySetInnerHTML={{__html: formatJobDescriptions(jobDescriptions),}} />
                              ) : (
                                <div className="text-gray-500 text-center">{t("room.empty")}</div>
                             )}
                            </div>
                         <div className="mt-4">
                             {UserImages && UserImages.length > 0 ? (
                              <div className="w-full">
                                    <Carousel data={UserImages} />
                              </div>
                                ) : (
                                    <div className="text-gray-500 text-center">
                                        {t("room.empty")}
                                      </div>
                                 )}
                         </div>
                       </div>
                    </div>
             </div>
            )}
            {showSubmitedForm && (
               <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-md p-6 relative max-h-[90vh] overflow-y-auto w-full max-w-md scrollbar-hide">
                      <button
                          className="absolute top-2 right-2 text-gray-700 hover:text-gray-900 cursor-pointer text-2xl"
                          onClick={() => {
                            setShowSubmitedForm(false);
                              setShowRoomTitle(true);
                          }}
                      >
                          X
                      </button>
                       <div className="mb-4">
                              <Carousel data={HostImages} />
                       </div>
                     <div className="mb-4">
                        <h2 className="text-xl font-semibold text-gray-800 text-center">{selectedUserFullName}</h2>
                     </div>
                     <div className="mb-4">
                         <Carousel data={selectedUserImages} />
                      </div>
                    <div className="flex justify-center items-center gap-4">
                          <button
                             className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              onClick={() => handleAccept()}
                           >
                             {t("room.accept")}
                         </button>
                          <button
                              className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              onClick={() => handleDeny(selectedUser)}
                          >
                               {t("room.deny")}
                         </button>
                        </div>
                          <button
                              type="submit"
                              className="bg-yellow-500 hover:bg-yellow-700 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 block mx-auto mt-4"
                              onClick={() => setShowReportFormForAdmin(true)}
                          >
                           <WarningIcon className="align-middle mr-2"/>
                            {t("reportForm.title")}
                         </button>
                   </div>
                </div>
              )}
              </>
            ) : (
              <div className="flex flex-col  p-4">
                <PrizePopup
                  room_id={id}
                  username={localStorage.getItem("username")}
                />
                <DenyForm
                  username={localStorage.getItem("username")}
                  room_id={id}
                />
                {/* Non-admin view */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <GroupsIcon />
                     <span>{members} {t("room.members")}</span>
                  </div>
                 <div className="flex gap-2">
                      <button
                          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-200"
                          onClick={() => setShowReportFormForUser(true)}
                        >
                            <MoreVertIcon />
                      </button>
                      <button
                          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-200"
                           onClick={() => setShowSettingFormUser(true)}
                        >
                          <LogoutIcon />
                      </button>
                 </div>
               </div>
                <button
                 className="p-2 bg-blue-500 hover:bg-blue-700 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 absolute bottom-20 right-5 z-1000"
                  onClick={UserShowUploadFormAndHiddenImages}
                >
                  <AddTaskIcon />
                </button>
                  {showRewardInfo && (
                       <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
                         <div className="bg-white rounded-md p-6 relative max-h-[90vh] overflow-y-auto scrollbar-hide">
                            <h2 className="text-xl font-bold mb-4 text-center">
                               {t("room.rewardsYouCanGet")}
                               </h2>
                              <div className="flex flex-col gap-4">
                                  {listVoucher.map((rewardInfo) => (
                                   <div key={rewardInfo.voucher_id} className="bg-white rounded-md shadow-md p-4  w-full max-w-md">
                                           <div className="flex  items-center border-b border-gray-200 pb-4 mb-2">
                                             <div className="w-16 h-16 mr-4 overflow-hidden rounded-full">
                                                  <img src={rewardInfo.host_avatar_url} alt="coupon" className="w-full h-full object-cover" />
                                              </div>
                                              <div className="flex-1">
                                                  <h2 className="text-lg font-semibold text-gray-800">{rewardInfo.discount_name}</h2>
                                             </div>
                                          </div>
                                       <div className="flex items-center justify-between mt-4">
                                            <span className="font-bold">
                                                   <span className="text-2xl text-blue-600">{rewardInfo.discount_value}</span> {t("reward.coupon")}
                                              </span>
                                         </div>
                                         <p className="text-gray-600 text-sm mt-2">{t('couponCard.validTill')} {new Date(rewardInfo.expiration_date).toLocaleDateString()}</p>
                                       <textarea className="mt-2 border p-2 rounded-md w-full h-20 text-sm text-gray-700 bg-gray-100" readOnly value={rewardInfo.discount_description} />
                                      </div>
                                    ))}
  
                                  {listTicket.map((rewardInfo) => (
                                      <div key={rewardInfo.voucher_id} className="bg-white rounded-md shadow-md p-4  w-full max-w-md">
                                            <div className="flex items-center justify-center border-b border-gray-200 pb-4 mb-2">
                                                <div className="w-64 h-64">
                                                  <img src={rewardInfo.ticket_image_url} alt="ticket" className="w-full h-full object-cover" />
                                                 </div>
                                              </div>
                                             <div className="flex flex-col gap-4">
                                              <h2 className="text-lg font-semibold text-gray-800 text-center">{rewardInfo.ticket_name}</h2>
                                                 <p className="text-gray-600 text-center mt-2">{rewardInfo.ticket_description}</p>
                                               </div>
                                            <input
                                                 className="bg-gray-100 border border-gray-300 mt-4 py-2 px-4 rounded-md w-full text-center"
                                                 readOnly
                                               value={`${t("reward.validTill")}: ${new Date(
                                                  rewardInfo.expiration_date
                                                ).toLocaleDateString()}`}
                                              />
                                       </div>
                                    ))}
                             </div>
                                <button
                                  className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 block mx-auto mt-4"
                                    onClick={closeRewardInfo}
                                >
                                     {t("room.close")}
                               </button>
                         </div>
                     </div>
                  )}
  
                {showUploadFormUser && (
                     <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <form  onSubmit={handleSubmit}
                          className="bg-white rounded-md p-6 relative max-w-md">
                          <h2 className="text-xl font-semibold mb-4 text-center">
                             {t("room.sendResultsToHost")}
                          </h2>
                          <div className="mt-4 flex items-center justify-center">
                              <label
                               htmlFor="fileInput"
                                 className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md cursor-pointer inline-block"
                                >
                                    <i className="fas fa-upload"></i> {t("room.selectFiles")}
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                  onChange={handleChange}
                                   className="hidden"
                                 multiple
                                  id="fileInput"
                             />
                                  {selectedFiles.length > 0 && (
                                      <div className="text-gray-700 mt-2">
                                          {selectedFiles.length} {t("room.filesSelected")}
                                      </div>
                                  )}
                          </div>
                       <button
                          className="absolute top-2 right-2 text-gray-700 hover:text-gray-900 cursor-pointer text-2xl"
                          onClick={UserShowUploadForm}
                            >
                             <CloseIcon />
                        </button>
                       <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 block mx-auto mt-4">
                           {t("room.submit")}
                           <SendIcon className="align-middle ml-2" />
                         </button>
                      </form>
                    </div>
                )}
  
                <div className="mt-4 text-center">
                   <h1 className="text-2xl font-semibold text-gray-800">
                     {" "}
                      {t("room.roomTitle")}{" "}
                     {roomTitle}
                     </h1>
                  <p className="text-gray-600 mt-2">
                      {t("room.host")}:
                      <Link to={`/profile/${HostID}`} className="text-blue-500 underline">
                           {roomDetails.fullname}
                       </Link>
                     </p>
                    <p
                        onClick={() => setShowRewardInfo(true)}
                        className="text-blue-500 underline cursor-pointer mt-2"
                      >
                       {t("room.rewardDetail")} !
                     </p>
                    <br />
                </div>
                {/* Message for non-admins when no content is available */}
                {!isAdmin && HostImages.length === 0 && (
                  <div className="text-center text-gray-600">
                    <p>{t("room.noContentMessage")}</p>
                    <p>{t("room.checkBackLater")}</p>
                  </div>
                )}
                {(jobDescriptions ||
                  (ShowImages &&
                    (HostImages.length > 0 || UserImages.length > 0))) && (
                  <div className="flex flex-col">
                     {jobDescriptions && (
                        <div className="text-left p-4">
                          <h2 className="text-lg text-center font-semibold text-gray-800">
                             {t("room.mission")}
                         </h2>
                          <div dangerouslySetInnerHTML={{__html: formatJobDescriptions(jobDescriptions),}} />
                       </div>
                      )}
                      {ShowImages && (
                       <div className="flex flex-col items-center mt-4 w-full">
                             {HostImages.length > 0 && (
                             <div className="w-full">
                                <Carousel data={HostImages} />
                            </div>
                           )}
                           {UserImages.length > 0 && (
                              <>
                               <div className="text-center mb-4">
                                     <h2 className="text-xl font-semibold text-gray-800">
                                        {localStorage.getItem("current_username")}
                                     </h2>
                                   </div>
                               <div className="w-full">
                                   <Carousel data={UserImages} />
                              </div>
                              </>
                               )}
                       </div>
                       )}
                    </div>
                  )}
                {showReportFormForUser && (
                  <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-1000">
                     <div className="p-6 relative max-w-md">
                        <ReportForm
                          roomId={id}
                           username={adminUsername}
                          onClose={() => setShowReportFormForUser(false)}
                          />
                      </div>
                 </div>
                )}
                {showSettingFormUser && (
                    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
                     <div className="bg-white rounded-md p-6 relative max-w-md">
                        <button
                             className="absolute top-2 right-2 text-gray-700 hover:text-gray-900 cursor-pointer text-2xl"
                              onClick={() => setShowSettingFormUser(false)}
                         >
                              X
                          </button>
                       <h2 className="text-xl font-semibold mb-4 text-center">
                           {t("room.warning")}
                         </h2>
                         <div className="flex flex-col gap-4">
                              <button
                                className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 block mx-auto"
                                 onClick={handleLeaveRoom}
                               >
                                <LogoutIcon className="align-middle mr-2"/>
                                <span>{t("room.leaveRoom")}</span>
                           </button>
                          <h3>{t("room.stillKeepVoucher")}</h3>
                    </div>
                  </div>
               </div>
                )}
              </div>
            )}
          </div>
          <div className="fixed w-full bottom-0 z-9999">
             <NavigationComponent />
           </div>
         </div>
    </div>
  );

  return (
    <div>
      {/* {isMobile ? renderMobileLayout() : renderDesktopLayout()} */}
      {renderMobileLayout()}
    </div>
  );
};

export default Room;
