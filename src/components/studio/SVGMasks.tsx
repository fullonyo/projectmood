"use client"

export function SVGMasks() {
    return (
        <svg width="0" height="0" className="absolute pointer-events-none">
            <defs>
                <clipPath id="mask-heart" clipPathUnits="objectBoundingBox">
                    <path d="M.5,1 C.5,1 .1,0.7 .1,0.4 C.1,0.2 .25,0.1 .4,0.1 C.45,0.1 .48,0.12 .5,0.15 C.52,0.12 .55,0.1 .6,0.1 C.75,0.1 .9,0.2 .9,0.4 C.9,0.7 .5,1 .5,1" />
                </clipPath>
                <clipPath id="mask-star" clipPathUnits="objectBoundingBox">
                    <path d="M.5,0 L.61,.35 L.98,.35 L.68,.57 L.79,.91 L.5,.7 L.21,.91 L.32,.57 L.02,.35 L.39,.35 Z" />
                </clipPath>
                <clipPath id="mask-blob1" clipPathUnits="objectBoundingBox">
                    <path d="M.45,.05 C.6,.1 .85,.1 .95,.35 C1.05,.6 .9,.85 .75,.95 C.6,1.05 .4,1.05 .25,.95 C.1,.85 -.05,.6 .05,.35 C.15,.1 .3,.0 .45,.05" />
                </clipPath>
                <clipPath id="mask-blob2" clipPathUnits="objectBoundingBox">
                    <path d="M.5,0 C.8,0 1,.1 1,.4 C1,.7 .9,.9 .6,1 C.3,1.1 0,.9 0,.6 C0,.3 .2,0 .5,0" /> 
                </clipPath>
                <clipPath id="mask-blob3" clipPathUnits="objectBoundingBox">
                    <path d="M.3,.1 C.5,0 .8,.1 .9,.3 C1,.5 .9,.8 .7,.9 C.5,1 .2,1 .1,.8 C0,.6 0,.3 .3,.1" />
                </clipPath>
            </defs>
        </svg>
    )
}
