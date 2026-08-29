/** @type {import('next').NextConfig} */
const nextConfig = {
    // @repo/shared ships raw NodeNext TypeScript — its relative imports carry a
    // `.js` extension that actually points at a sibling `.ts`. Let Next compile
    // the package and teach both bundlers to resolve `.js` -> `.ts`.
    transpilePackages: ["@repo/shared", "@repo/ui"],

    // NOTE: this app runs on webpack (see `--webpack` in package.json scripts).
    // Turbopack does not yet rewrite `.js` -> `.ts` for transpiled workspace
    // packages, which @repo/shared relies on. Revisit when that lands.
    webpack: (config) => {
        config.resolve.extensionAlias = {
            ".js": [".ts", ".tsx", ".js"],
            ".jsx": [".tsx", ".jsx"],
        };
        return config;
    },
};

export default nextConfig;
