/*
	jsrepo 1.41.3
	Installed from github/ieedan/shadcn-svelte-extras
	04-03-2025
*/

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
