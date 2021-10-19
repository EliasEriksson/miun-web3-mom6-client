const {src, dest, watch, series, parallel} = require("gulp");
const sass = require('gulp-sass')(require('sass'));
const terser = require('gulp-terser');
const cssnano = require("gulp-cssnano");
const babel = require('gulp-babel');
const ts = require('gulp-typescript');


const tsProject = ts.createProject('tsconfig.json');

const srcRoot = "./src";
const srcPaths = {
    sass: `${srcRoot}/sass/**/*.scss`,
    ts: `${srcRoot}/ts/**/*.ts`,
}

const destRoot = "./public";
const destPaths = {
    js: `${destRoot}/js/`,
    css: `${destRoot}/css`
}

const compileSass = () => {
    return src(
        srcPaths.sass
    ).pipe(
        sass().on("error", sass.logError)
    ).pipe(
        dest(destPaths.css)
    );
}

const compileTs = () => {
    return src(
        srcPaths.ts
    ).pipe(
        tsProject()
    ).pipe(
        dest(destPaths.js)
    )
}

const serve = () => {
    watch(srcPaths.ts, compileTs);
    watch(srcPaths.sass, compileSass);
}

exports.default = series(
    parallel(compileTs, compileSass),
    serve
)