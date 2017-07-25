createLobbyBtn.addEventListener("click", function() {
    optionPanel.style.display = "block";
    optionPanel.getElementsByClassName("popup")[0].style.left = "50%";
    optionPanel.getElementsByClassName("popup")[0].style.top = "50%";
    validationClock = setInterval(validateCreateLobby, 0);
});
createLobbyConfirm.addEventListener("click", function() {
    if (validateCreateLobby()) {
        createLobbyRequest(parseInt(createLobbyWidth.value), parseInt(createLobbyHeight.value), createLobbyBgColor.value);
        clearInterval(validationClock);
    }
});
submitIDBtn.addEventListener("click", function() {
    joinLobbyRequest(Number(lobbyIDInput.value));
});
createLobbyBgColor.addEventListener("keydown", function() {
    setTimeout(function() {
        createLobbyBgColor.style.borderColor = createLobbyBgColor.value;
    }, 16);
});
function validateCreateLobby() {
    if (Number(createLobbyWidth.value) >= 256 && Number(createLobbyHeight.value) >= 256 && Number(createLobbyWidth.value) <= 16384 && Number(createLobbyHeight.value) <= 16384) {
        createLobbyConfirm.disabled = false;
        createLobbyWidth.style.background = "white";
        createLobbyHeight.style.background = "white";
        createLobbyConfirm.style.opacity = 1;
        return true;
    } else {
        createLobbyConfirm.disabled = true;
        createLobbyWidth.style.background = "red";
        createLobbyHeight.style.background = "red";
        createLobbyConfirm.style.opacity = 0.333;
        return false;
    }
}
function createLobbyRequest(width, height, bgColor) {
    if (connected && !connectingToLobby) {
        connectingToLobby = true;

        socket.send(JSON.stringify([0, width, height, bgColor]));

        socket.onmessage = lobbyJoinHandler;
    }
}

function joinLobbyRequest(ID) {
    if (connected && !connectingToLobby) {
        connectingToLobby = true;

        socket.send(JSON.stringify([1, ID]));

        socket.onmessage = lobbyJoinHandler;
    }
}