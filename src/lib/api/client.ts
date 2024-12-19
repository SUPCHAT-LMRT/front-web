import axios from "axios";
import { PUBLIC_API_ORIGIN } from "$env/static/public";

export const baseClient = axios.create({
    baseURL: PUBLIC_API_ORIGIN,
    withCredentials: true
})