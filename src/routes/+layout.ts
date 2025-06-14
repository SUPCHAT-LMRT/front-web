import "$lib/assets/styles/app.css";
import { redirect } from "@sveltejs/kit";
import type { LayoutLoad } from "./$types";

export const ssr = false;
export const prerender = false;

export const load: LayoutLoad = async ({ url }) => {
	if (url.pathname === '/download-app') {
		return {};
	}

	const userAgent = navigator.userAgent || '';

	// Simple mobile detection
	const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

	if (isMobile) {
		// Redirect to external website
		redirect(302, '/download-app');
	}

	return {};
}