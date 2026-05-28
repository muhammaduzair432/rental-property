// Temporary fail-safe hook to verify UI output before connecting full Redux states
export const useAuthActions = () => {
    const login = async (credentials) => {
        console.log("Simulated Login API Handshake:", credentials);
        return { success: true };
    };

    const register = async (formDataInstance) => {
        console.log("Simulated Register FormData processing...");
        for (let pair of formDataInstance.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }
        return { success: true };
    };

    return { login, register };
};