// src/auth.js
const verifyToken = async () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  try {
    const response = await fetch(`${apiUrl}/verify-token-admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token_admin"),
      },
    });
    const data = await response.json();
    const adminUsername = localStorage.getItem("admin_username");
    if (data.success && data.user.username === adminUsername) {
      return true;
    } else {
      return false;
    }
  }
  catch (error) {
    return false;
  }
};

export default verifyToken;

