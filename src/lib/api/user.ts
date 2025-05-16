import {baseClient} from "$lib/api/client";
import type {Job} from "$lib/api/admin";

export enum PublicStatus {
    UNKNOWN = "unknown",
    ONLINE = "online",
    DO_NOT_DISTURB = "do-not-disturb",
    AWAY = "away",
    OFFLINE = "offline",
}

export enum PrivateStatus {
    UNKNOWN = "unknown",
    ONLINE = "online",
    DO_NOT_DISTURB = "do-not-disturb",
    AWAY = "away",
    INVISIBLE = "invisible",
    OFFLINE = "offline",
}

export type User = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    status: PrivateStatus;
    jobs: Job[];
};

export const registerUser = async (
    token: string,
    password: string,
    passwordConfirmation: string,
): Promise<void> => {
    try {
        await baseClient.post("/api/account/auth/register", {
            token,
            password,
            passwordConfirmation,
        });
    } catch (e) {
        console.error(e);
        console.log(e);
        throw e;
    }
};

export const loginUser = async (
    email: string,
    password: string,
    rememberMe: boolean,
): Promise<User> => {
    try {
        const {data} = await baseClient.post("/api/account/auth/login", {
            email,
            password,
            rememberMe,
        });
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const logout = async (): Promise<void> => {
    try {
        await baseClient.post("/api/account/auth/logout");
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const refreshAccessToken = () => {
    return baseClient.post("/api/account/auth/token/access/renew");
};

export const validateAccount = async (token: string): Promise<void> => {
    try {
        await baseClient.post(`/api/account/validation/validate`, {
            validationToken: token,
        });
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const requestForgotPassword = async (email: string): Promise<void> => {
    try {
        await baseClient.post("/api/account/forgot-password/request", {email});
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const forgotPassword = async (
    token: string,
    newPassword: string,
    newPasswordConfirmation: string,
): Promise<void> => {
    try {
        await baseClient.post(`/api/account/forgot-password/validate`, {
            token,
            newPassword,
            newPasswordConfirmation,
        });
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const requestResetPassword = async (): Promise<void> => {
    try {
        await baseClient.post("/api/account/reset-password/request");
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const resetPassword = async (
    token: string,
    newPassword: string,
    newPasswordConfirmation: string,
): Promise<void> => {
    try {
        await baseClient.post(`/api/account/reset-password/validate`, {
            token,
            newPassword,
            newPasswordConfirmation,
        });
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const getLoginUser = async (): Promise<User> => {
    try {
        const {data} = await baseClient.get("/api/account/me");
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const getInviteLinkData = async (token: string): Promise<User> => {
    try {
        const {data} = await baseClient.get(`/api/account/invite-link/${token}`);
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export type UserProfile = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    status: PublicStatus;
};

export const getUserProfile = async (userId: string): Promise<UserProfile> => {
    try {
        const {data} = await baseClient.get(`/api/account/${userId}/profile`);
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
};


export const changeUserStatus = async (
    status: PrivateStatus,
): Promise<void> => {
    try {
        await baseClient.patch("/api/account/status", {status});
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export const listAllUsers = async (): Promise<User[]> => {
    try {
        const {data} = await baseClient.get("/api/account/users");
        return data;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export const updateUserAvatar = async (
    image: File,
): Promise<void> => {
    try {
        const formData = new FormData();
        formData.append("image", image);
        await baseClient.patch("/api/account/avatar", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    } catch (e) {
        console.error(e);
        throw e;
    }
}
export const deleteUser= async (
    userId: string,
): Promise<void> => {
    try {
        await baseClient.delete(`/api/account/auth/delete/${userId}`);
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export const updateUser = async (
    userId: string,
    firstName: string,
    lastName: string,
    email: string,
): Promise<void> => {
    try {
        await baseClient.put(`/api/account/${userId}`, {
            firstName,
            lastName,
            email,
        });
    } catch (e) {
        console.error(e);
        throw e;
    }
}