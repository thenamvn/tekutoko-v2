// src/auth.js
const verifyToken = async () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  try {
    const response = await fetch(`${apiUrl}/verify-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    const data = await response.json();
    const adminUsername = localStorage.getItem("username");
    if (data.success && data.user.username === adminUsername) {
      return true;
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      return false;
    }
  }
  catch (error) {
    return false;
  }
};

export default verifyToken;

