/** @type {import('next').NextConfig} */
const nextConfig = {
    compiler: {
        // removeConsole: {
        //     exclude: ["error"]
        // },
    },
    async redirects() {
        return [
            {
                source: "/:lang/app/:id/preferences/my-organization",
                destination: "/:lang/app/:id/preferences/my-organization/overview",
                permanent: true,
            }
        ];
    },
    async rewrites() {
        return [
            {
                source: '/api/proxy/:path*',
                destination: 'https://api.relifaid.org/api/v1/:path*',
            },
        ];
    },
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
                    { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
                ],
            },
        ];
    },
    experimental: {
        // Required for Supabase server-side auth to work
        serverComponentsExternalPackages: ['@supabase/supabase-js'],
    },
};

export default nextConfig;
