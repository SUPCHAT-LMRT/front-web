import axios from "axios";
import { env } from '$env/dynamic/public';

export const baseClient = axios.create({
    baseURL: env.PUBLIC_API_ORIGIN,
    withCredentials: true
})
