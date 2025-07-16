// utils/gameUtils.js

export const createGame = (navigate) => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token'); // Lấy token từ localStorage
  // Generate a unique room ID that includes both letters and numbers
  const newRoomId = Math.random().toString(36).substring(2, 7);

  // TODO: Save the room ID in your database or app state
  fetch(`${apiUrl}/createroom`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` // Thêm token vào header
    },
    body: JSON.stringify({
      id: newRoomId,
      admin_username: localStorage.getItem("username"),
    })
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Network response was not ok: ${response.status} - ${errorText}`
        );
      }
      return response.json();
    })
    .then((data) => {
      console.log(data.message);
      // Navigate to the room page
      navigate(`/room/${newRoomId}`);
    })
    .catch((error) => {
      console.error("Error creating room:", error);
    });
};

export const joinGame = (id, navigate) => {
  const apiUrl = process.env.REACT_APP_API_URL;
  // Fetch room details from the backend
  fetch(`${apiUrl}/room/${id}/info`)
    .then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Network response was not ok: ${response.status} - ${errorText}`
        );
      }
      return response.json();
    })
    .then((data) => {
      if (data.admin_username === localStorage.getItem("username")) {
        navigate(`/room/${id}`);
      } else {
        fetch(`${apiUrl}/joinroom`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: document.getElementById("room-code").value,
            username: localStorage.getItem("username"),
          })
        })
          .then(async (response) => {
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(
                `Network response was not ok: ${response.status} - ${errorText}`
              );
            }
            return response.json();
          })
          .then((data) => {
            console.log(data.message);
            // Navigate to the room page
            navigate(`/room/${id}`);
          })
          .catch((error) => {
            console.error("Error joining room:", error);
          });
      }
    })
    .catch((error) => {
      console.error("Error fetching room info:", error);
    });
};

export const joinGameInList = (roomId, navigate) => {
  navigate(`/room/${roomId}`);
};