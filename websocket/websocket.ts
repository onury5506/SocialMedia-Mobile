import { io } from "socket.io-client";
import store from "@/store/store";
import { refresh } from "@/api/auth.api";

const websocketPath = "http://192.168.1.109:3000/socket";

let state = store.getState();

const socket = io(websocketPath, {
    auth: {
        token: state?.user?.auth?.accessToken
    }
});

socket.on("connect", () => {
    console.log("Connected to websocket");
});

socket.on("disconnect", () => {
    console.log("Disconnected from websocket");
});

socket.on("reconnect", () => {
    console.log("Reconnected to websocket");
})

socket.on("unauthorized", ()=>{
    const state = store.getState();
    if(!state.user.auth){
        return
    }
    refresh({
        refreshToken: state.user.auth.refreshToken
    }).catch(()=>{})
})

store.subscribe(() => {
    const _state = store.getState();
    const auth = _state.user.auth;

    if (auth && auth !== state.user.auth) {
        socket.auth = {
            token: auth.accessToken
        };

        if(!socket.connected) {
            socket.connect();
        }

        state = _state;
    }
});

export default socket;