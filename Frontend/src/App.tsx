import { useEffect } from "react";
import { store } from "./app/store";
import { restoreSession } from "./features/auth/authThunks";
import AppRoutes from "./routes/AppRoutes";
import { listenForLogout } from "./utils/authSync";
import { clearAuth } from "./features/auth/authSlice";



const App = () => {

    useEffect(() => {
        //  restore session on page load
        (store.dispatch as any)(restoreSession());

        // listen for logout from other tabs
        const cleanup = listenForLogout(() => {
            store.dispatch(clearAuth());
        });

        return cleanup;

    }, []);

    return <AppRoutes />;
};

export default App;