/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    env: {
        KAKAO_REST_API_KEY: process.env.KAKAO_REST_API_KEY,
        KAKAO_JS_API_KEY: process.env.KAKAO_JS_API_KEY,
    },
}

module.exports = nextConfig;
