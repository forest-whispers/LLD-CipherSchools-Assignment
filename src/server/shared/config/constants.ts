export const constants = {
    ACCESS_TOKEN_EXPIRY: "15m",

    ACCESS_COOKIE_NAME: "accesToken",

    ACCESS_TOKEN_TTL_MS: 24 * 60 * 60 * 1000,
    ACCESS_COOKIE_MAX_AGE: 24 * 60 * 60 * 1000,

    ACCESS_COOKIE_PATH: "/api/"
} as const;