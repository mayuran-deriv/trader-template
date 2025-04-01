import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginBasicSsl } from "@rsbuild/plugin-basic-ssl";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

export default defineConfig({
    plugins: [pluginReact(), pluginBasicSsl()],
    html: {
        template: "./index.html",
        title: "deriv Api template",
    },
    source: {
        define: {
            "process.env.RSBUILD_REST_URL": JSON.stringify(process.env.RSBUILD_REST_URL),
            "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
            "process.env.RSBUILD_SSE_PUBLIC_PATH": JSON.stringify(
                process.env.RSBUILD_SSE_PUBLIC_PATH
            ),
        },
        alias: {
            "@": "./src",
        },
    },
    server: {
        port: 4113,
        host: "localhost",
        strictPort: true,
    },
    output: {
        copy: [
            {
                from: path.resolve(__dirname, "node_modules/@deriv-com/smartcharts-champion/dist"),
                to: "js/smartcharts/",
                globOptions: {
                    ignore: ["**/*.LICENSE.txt", "**/favicon.png"],
                },
            },
            {
                from: path.resolve(
                    __dirname,
                    "node_modules/@deriv-com/smartcharts-champion/dist/chart/assets"
                ),
                to: "assets",
            },
        ],
        filename: {
            js: "[name].[hash:8].js",
            css: "[name].[hash:8].css",
            assets: "assets/[name].[hash:8][ext]",
        },
        distPath: {
            js: "js",
            css: "css",
            html: "",
        },
        cleanDistPath: true,
    },
});
