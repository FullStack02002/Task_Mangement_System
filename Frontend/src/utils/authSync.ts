const LOGOUT_KEY = "auth:logout";

export const broadcastLogout = () => {
    localStorage.setItem(LOGOUT_KEY, Date.now().toString());
    localStorage.removeItem(LOGOUT_KEY); 
};

export const listenForLogout = (onLogout: () => void) => {
    const handler = (event: StorageEvent) => {
        if (event.key === LOGOUT_KEY) {
            onLogout();
        }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler); 
};