const {src, dest, watch, series, parallel} = require("gulp");
const sass = require('gulp-sass')(require('sass'));
const terser = require('gulp-terser');
const cssnano = require("gulp-cssnano");
const ts = require('gulp-typescript');
const browserSync = require("browser-sync").create();
const tsProject = ts.createProject('tsconfig.json');

// source roots
const srcRoot = "./src";
const srcPaths = {
    sass: `${srcRoot}/sass/**/*.scss`,
    ts: `${srcRoot}/ts/**/*.ts`,
}

// public roots
const destRoot = "./public";
const destPaths = {
    js: `${destRoot}/js/`,
    css: `${destRoot}/css`
}

/**
 * compiles sass to css and minifies the css
 *
 * @returns {Stream.Transform|*}
 */
const compileSass = () => {
    return src(
        srcPaths.sass
    ).pipe(
        sass().on("error", sass.logError)
    ).pipe(
        cssnano()
    ).pipe(
        dest(destPaths.css)
    ).pipe(
        browserSync.stream()
    );
}

/**
 * compiles TS to JS and minimizes the JS
 *
 * @returns {Stream.Transform|*}
 */
const compileTs = () => {
    return src(
        srcPaths.ts
    ).pipe(
        tsProject()
    ).pipe(
        terser()
    ).pipe(
        dest(destPaths.js)
    ).pipe(
        browserSync.stream()
    )
}

/**
 * watch tasks
 */
const serve = () => {
    browserSync.init({
        server: "./public/"
    })
    watch(srcPaths.ts, compileTs).on("change", browserSync.reload);
    watch(srcPaths.sass, compileSass).on("change", browserSync.reload);
}

exports.default = series(
    parallel(compileTs, compileSass),
    serve
)