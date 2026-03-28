import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  rewrites: async () => {
    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination:
            process.env.NODE_ENV === "development"
              ? "http://127.0.0.1:8000/api/:path*"
              : (process.env.PYTHON_API_URL ?? "http://127.0.0.1:8000") +
                "/api/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
