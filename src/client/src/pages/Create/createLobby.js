const createLobby = lobbyData =>
  fetch("/api/create-lobby", {
    method: "post",
    body: JSON.stringify(lobbyData),
    headers: {
      "Content-type": "application/json"
    }
  }).then(response => {
    return response.json();
  });

export default createLobby;
