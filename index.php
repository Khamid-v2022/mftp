<?php require_once("base.php") ?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <base href="<?php if (strlen($base) > 0) { print("/".$base."/"); } else { print("/"); } ?>" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/x-icon" href="favicon.ico" />
        <script>
            const API_URL = "<?php if (strlen($base) > 0) { print("/".$base); } else { print("/"); } ?>"
        </script>
        <style>
            @charset "UTF-8";
            :root {
                --bs-blue: #0d6efd;
                --bs-indigo: #6610f2;
                --bs-purple: #6f42c1;
                --bs-pink: #d63384;
                --bs-red: #dc3545;
                --bs-orange: #fd7e14;
                --bs-yellow: #ffc107;
                --bs-green: #198754;
                --bs-teal: #20c997;
                --bs-cyan: #0dcaf0;
                --bs-white: #fff;
                --bs-gray: #6c757d;
                --bs-gray-dark: #343a40;
                --bs-gray-100: #f8f9fa;
                --bs-gray-200: #e9ecef;
                --bs-gray-300: #dee2e6;
                --bs-gray-400: #ced4da;
                --bs-gray-500: #adb5bd;
                --bs-gray-600: #6c757d;
                --bs-gray-700: #495057;
                --bs-gray-800: #343a40;
                --bs-gray-900: #212529;
                --bs-primary: #0d6efd;
                --bs-secondary: #6c757d;
                --bs-success: #198754;
                --bs-info: #0dcaf0;
                --bs-warning: #ffc107;
                --bs-danger: #dc3545;
                --bs-light: #f8f9fa;
                --bs-dark: #212529;
                --bs-primary-rgb: 13, 110, 253;
                --bs-secondary-rgb: 108, 117, 125;
                --bs-success-rgb: 25, 135, 84;
                --bs-info-rgb: 13, 202, 240;
                --bs-warning-rgb: 255, 193, 7;
                --bs-danger-rgb: 220, 53, 69;
                --bs-light-rgb: 248, 249, 250;
                --bs-dark-rgb: 33, 37, 41;
                --bs-white-rgb: 255, 255, 255;
                --bs-black-rgb: 0, 0, 0;
                --bs-body-color-rgb: 33, 37, 41;
                --bs-body-bg-rgb: 255, 255, 255;
                --bs-font-sans-serif: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
                --bs-font-monospace: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                --bs-gradient: linear-gradient(180deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0));
                --bs-body-font-family: var(--bs-font-sans-serif);
                --bs-body-font-size: 1rem;
                --bs-body-font-weight: 400;
                --bs-body-line-height: 1.5;
                --bs-body-color: #212529;
                --bs-body-bg: #fff;
            }
            *,
            *:before,
            *:after {
                box-sizing: border-box;
            }
            @media (prefers-reduced-motion: no-preference) {
                :root {
                    scroll-behavior: smooth;
                }
            }
            body {
                margin: 0;
                font-family: var(--bs-body-font-family);
                font-size: var(--bs-body-font-size);
                font-weight: var(--bs-body-font-weight);
                line-height: var(--bs-body-line-height);
                color: var(--bs-body-color);
                text-align: var(--bs-body-text-align);
                background-color: var(--bs-body-bg);
                -webkit-text-size-adjust: 100%;
                -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
            }
            * {
                font-family: Graphik, sans-serif;
                outline: none;
                -webkit-user-select: none;
                -o-user-select: none;
                user-select: none;
            }
            body {
                font-family: Graphik-Regular, sans-serif;
                overflow-x: hidden;
                background: #fff;
            }
            body::-webkit-scrollbar-track {
                border-radius: 15px;
            }
            body::-webkit-scrollbar {
                width: 3px;
                background-color: #ececec;
            }
            body::-webkit-scrollbar-thumb {
                border-radius: 15px;
                background-color: #353535;
            }
            @font-face {
                font-family: Graphik;
                src: url(./assets/fonts/Graphik-Regular.9908d7804814905d.ttf) format("truetype");
                font-weight: 400;
                font-style: normal;
            }
            @font-face {
                font-family: Graphik;
                src: url(./assets/fonts/Graphik-RegularItalic.70b33cc116dcae17.ttf) format("truetype");
                font-weight: 400;
                font-style: italic;
            }
            @font-face {
                font-family: Graphik;
                src: url(./assets/fonts/Graphik-Bold.0b0fe020127f1dd0.ttf) format("truetype");
                font-weight: 700;
                font-style: normal;
            }
            @font-face {
                font-family: Graphik;
                src: url(./assets/fonts/Graphik-BoldItalic.dd57f0442899ea61.ttf) format("truetype");
                font-weight: 700;
                font-style: italic;
            }
            html,
            body {
                height: 100%;
                min-height: 100vh;
                padding: 0;
            }
            body {
                margin: 0;
                font-family: Graphik-Regular, Helvetica Neue, sans-serif;
            }
        </style>
        <link rel="stylesheet" href="assets/css/styles.fde81738590e87e4.css" media="print" onload="this.media='all'" />
        <noscript><link rel="stylesheet" href="assets/css/styles.fde81738590e87e4.css" /></noscript>
    </head>
    <body>
        <app-root></app-root>
        <script src="assets/js/runtime.651e6c891855a83d.js" type="module"></script>
        <script src="assets/js/polyfills.5622b5c5e516626d.js" type="module"></script>
        <script src="assets/js/main.9aceb7c1a2cc9d9d.js" type="module"></script>

    </body>
</html>
