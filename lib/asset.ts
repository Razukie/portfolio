/**
 * Prefix a file in /public with the site's base path.
 *
 * On GitHub Pages the site lives at https://razukie.github.io/portfolio/, so
 * "/assets/profile.jpg" must become "/portfolio/assets/profile.jpg". The
 * deploy workflow sets NEXT_PUBLIC_BASE_PATH=/portfolio; locally it's empty.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const asset = (path: string) => `${BASE_PATH}${path}`;
