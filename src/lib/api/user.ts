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

export const validateAccount = async (token: string): Promise<void> => {
    try {
        await baseClient.post(`/account/validation/validate`, {validationToken: token});
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export const forgotPassword = async (token: string, newPassword: string, newPasswordConfirmation: string): Promise<void> => {
    try {
        await baseClient.post(`/account/forgot-password`, {validationToken: token, newPassword, newPasswordConfirmation});
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export const resetPassword = async (token: string, newPassword: string, newPasswordConfirmation: string): Promise<void> => {
    try {
        await baseClient.post(`/account/reset-password`, {validationToken: token, newPassword, newPasswordConfirmation});
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