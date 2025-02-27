import { baseClient } from "$lib/api/client";

export type User = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    pseudo: string;
    birthDate: Date;
    password: string;
    passwordConfirm: string;
    verified: boolean;
    createdAt: Date;
};

export type AuthResponse = {
    user: User;
    token: string;
};

export const registerUser = async (
    email: string,
    password: string,
    passwordConfirmation: string,
    firstName: string,
    lastName: string,
    pseudo: string,
    birthDate: string
): Promise<AuthResponse> => {
    try {
        const { data } = await baseClient.post("/api/account/auth/register", { email, password, passwordConfirmation, firstName, lastName, pseudo, birthDate });
        return data;
    } catch (e) {
        console.error(e);
        console.log(e);
        throw e;
    }
};

export const loginUser = async (email: string, password: string, rememberMe: boolean): Promise<AuthResponse> => {
    try {
        const { data } = await baseClient.post("/api/account/auth/login", { email, password, rememberMe });
        return data;
    }
    catch (e) {
        console.error(e);
        throw e;
    }
}

export const logout = async (): Promise<void> => {
    try {
        await baseClient.post("/api/account/auth/logout");
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export const refreshAccessToken = () => {
    return baseClient.post("/api/account/auth/token/access/renew");
}

export const validateAccount = async (token: string): Promise<void> => {
    try {
        await baseClient.post(`/api/account/validation/validate`, {validationToken: token});
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export const requestForgotPassword = async (email: string): Promise<void> => {
    try {
        await baseClient.post("/api/account/forgot-password/request", {email});
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export const forgotPassword = async (token: string, newPassword: string, newPasswordConfirmation: string): Promise<void> => {
    try {
        await baseClient.post(`/api/account/forgot-password/validate`, {token, newPassword, newPasswordConfirmation});
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export const requestResetPassword = async (): Promise<void> => {
    try {
        await baseClient.post("/api/account/reset-password/request");
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export const resetPassword = async (token: string, newPassword: string, newPasswordConfirmation: string): Promise<void> => {
    try {
        await baseClient.post(`/api/account/reset-password/validate`, {token, newPassword, newPasswordConfirmation});
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export const getLoginUser = async (): Promise<User> => {
    try {
        const { data } = await baseClient.get("/api/account/me");
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export const getInviteLinkData = async (token: string): Promise<User> => {
    try {
        const { data } = await baseClient.get(`/api/account/invite-link/${token}`);
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
}