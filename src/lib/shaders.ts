export const AURORA_SHADER = `
    precision highp float;
    uniform float iTime;
    uniform vec2 iResolution;

    void main() {
        vec2 uv = gl_FragCoord.xy / iResolution.xy;
        float time = iTime * 0.2;
        
        vec3 col = vec3(0.0);
        for(float i=0.0; i<3.0; i++) {
            float t = time + i * 0.5;
            float y = uv.y + 0.2 * sin(uv.x * 5.0 + t);
            float alpha = smoothstep(0.4, 0.5, y) * (1.0 - smoothstep(0.5, 0.6, y));
            col += alpha * vec3(0.2*i, 0.5-0.1*i, 0.8-0.2*i);
        }
        
        gl_FragColor = vec4(col * 0.3, col.r * 0.5);
    }
`

export const NOISE_SHADER = `
    precision highp float;
    uniform float iTime;
    uniform vec2 iResolution;

    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
        vec2 uv = gl_FragCoord.xy / iResolution.xy;
        float n = random(uv + iTime * 0.01);
        gl_FragColor = vec4(vec3(n), 0.05);
    }
`

export const LIQUID_SHADER = `
    precision highp float;
    uniform float iTime;
    uniform vec2 iResolution;

    void main() {
        vec2 uv = gl_FragCoord.xy / iResolution.xy;
        float t = iTime * 0.5;
        
        vec2 p = uv * 3.0;
        for(int i=1; i<4; i++) {
            float fi = float(i);
            p += vec2(0.7/fi*sin(fi*p.y+t+0.3*fi)+0.8, 0.4/fi*sin(fi*p.x+t+0.3*fi)+1.6);
        }
        
        vec3 col = vec3(0.5 + 0.5*sin(p.x), 0.5 + 0.5*sin(p.y), 0.5 + 0.5*sin(p.x+p.y));
        gl_FragColor = vec4(col * 0.2, 0.2);
    }
`

export const MESH_GRADIENT_SHADER = `
    precision highp float;
    uniform float iTime;
    uniform vec2 iResolution;
    uniform vec3 uColor;

    void main() {
        vec2 uv = gl_FragCoord.xy / iResolution.xy;
        float t = iTime * 0.5;
        
        vec3 col1 = uColor * 0.8;
        vec3 col2 = vec3(uColor.g, uColor.b, uColor.r) * 0.5;
        vec3 col3 = vec3(0.1, 0.1, 0.2);
        
        float n = sin(uv.x * 3.0 + t) * cos(uv.y * 2.0 - t * 0.5);
        vec3 finalCol = mix(col1, col2, uv.x + n * 0.2);
        finalCol = mix(finalCol, col3, uv.y - n * 0.1);
        
        gl_FragColor = vec4(finalCol, 0.4);
    }
`

export const METABALLS_SHADER = `
    precision highp float;
    uniform float iTime;
    uniform vec2 iResolution;
    uniform vec2 uMouse;
    uniform vec3 uColor;

    void main() {
        vec2 uv = gl_FragCoord.xy / iResolution.xy;
        vec2 mouse = uMouse / iResolution.xy;
        float aspect = iResolution.x / iResolution.y;
        uv.x *= aspect;
        mouse.x *= aspect;

        float dist = 0.0;
        
        // Mouse ball
        dist += 0.05 / (distance(uv, mouse) + 0.001);
        
        // Animated balls
        for(float i=0.0; i<5.0; i++) {
            vec2 pos = vec2(
                (0.5 + 0.3 * sin(iTime * 0.5 + i)) * aspect,
                0.5 + 0.2 * cos(iTime * 0.3 + i * 1.5)
            );
            dist += 0.03 / (distance(uv, pos) + 0.001);
        }

        vec3 color = uColor * smoothstep(0.4, 1.0, dist);
        gl_FragColor = vec4(color, color.r * 0.3);
    }
`

export const HYPERSPEED_SHADER = `
    precision highp float;
    uniform float iTime;
    uniform vec2 iResolution;
    uniform vec3 uColor;

    void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / min(iResolution.y, iResolution.x);
        float t = iTime * 2.0;
        
        float angle = atan(uv.y, uv.x);
        float dist = length(uv);
        
        float s = 0.5 / (dist + 0.01);
        float pulse = sin(s + t) * 0.5 + 0.5;
        
        vec3 color = uColor * pulse * dist;
        color += uColor * 0.2 * sin(angle * 10.0 + t);
        
        gl_FragColor = vec4(color, dist * 0.5);
    }
`

export const GRID_SHADER = `
    precision highp float;
    uniform float iTime;
    uniform vec2 iResolution;
    uniform vec3 uColor;

    void main() {
        vec2 uv = gl_FragCoord.xy / iResolution.xy;
        float t = iTime * 0.2;
        
        vec2 grid = fract(uv * 20.0 + vec2(0.0, t));
        float line = smoothstep(0.0, 0.05, grid.x) * smoothstep(1.0, 0.95, grid.x) *
                     smoothstep(0.0, 0.05, grid.y) * smoothstep(1.0, 0.95, grid.y);
        
        vec3 color = uColor * (1.0 - line);
        gl_FragColor = vec4(color, color.r * 0.1);
    }
`

export const STARS_SHADER = `
    precision highp float;
    uniform float iTime;
    uniform vec2 iResolution;
    uniform vec3 uColor;

    float hash(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / min(iResolution.y, iResolution.x);
        float t = iTime * 0.1;
        
        vec3 color = vec3(0.0);
        for(float i=0.0; i<50.0; i++) {
            float z = fract(hash(vec2(i, i)) + t);
            vec2 p = vec2(hash(vec2(i, i+1.0)), hash(vec2(i+2.0, i+3.0))) * 2.0 - 1.0;
            p /= z;
            float size = 0.002 / z;
            float star = smoothstep(size, 0.0, length(uv - p));
            color += star * uColor;
        }
        
        gl_FragColor = vec4(color, length(color));
    }
`

export const RAIN_SHADER = `
    precision highp float;
    uniform float iTime;
    uniform vec2 iResolution;

    float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
    }

    void main() {
        vec2 uv = gl_FragCoord.xy / iResolution.xy;
        vec2 p = uv;
        p.x *= iResolution.x / iResolution.y;
        
        float t = iTime * 0.5;
        vec2 rainUV = p * 4.0;
        rainUV.y += t * 0.5;
        
        vec2 id = floor(rainUV);
        vec2 gv = fract(rainUV) - 0.5;
        
        float h = hash(id);
        gv.y += h * 2.0;
        
        float drop = smoothstep(0.05, 0.0, length(gv * vec2(1.0, 0.15)));
        float trail = smoothstep(0.03, 0.0, length(gv.x)) * smoothstep(0.5, -0.5, gv.y) * 0.5;
        
        vec3 col = vec3(0.05, 0.05, 0.1);
        col += (drop + trail) * 0.2;
        
        gl_FragColor = vec4(col, 0.3 + drop * 0.4);
    }
`

export const RHYTHM_SHADER = `
    precision highp float;
    uniform float iTime;
    uniform vec2 iResolution;
    uniform vec3 uColor;

    void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / min(iResolution.y, iResolution.x);
        float t = iTime * 1.5;
        
        float dist = length(uv);
        float wave = sin(dist * 20.0 - t) * 0.5 + 0.5;
        wave *= exp(-dist * 2.0);
        
        vec3 color = uColor * wave;
        gl_FragColor = vec4(color, wave * 0.2);
    }
`

export const VINTAGE_SHADER = `
    precision highp float;
    uniform float iTime;
    uniform vec2 iResolution;

    float random(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
        vec2 uv = gl_FragCoord.xy / iResolution.xy;
        
        float grain = random(uv + iTime * 0.1);
        float vignette = 1.0 - length(uv - 0.5) * 1.5;
        
        float scratch = step(0.999, random(vec2(uv.x, iTime * 0.001)));
        scratch *= random(vec2(uv.x, iTime)) * 0.5;
        
        vec3 color = vec3(0.4, 0.35, 0.3); // Sepia base
        color *= vignette;
        color += grain * 0.08;
        color += scratch * 1.0;
        
        gl_FragColor = vec4(color, 0.2);
    }
`

export const UNIVERSE_SHADER = `
    precision highp float;
    uniform float iTime;
    uniform vec2 iResolution;
    uniform vec3 uColor;

    float hash(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / min(iResolution.y, iResolution.x);
        float t = iTime * 0.05;
        
        vec3 color = vec3(0.0);
        
        for(float i=1.0; i<4.0; i++) {
            float speed = i * 0.2;
            vec2 l_uv = uv * (i * 10.0) + vec2(t * speed, 0.0);
            vec2 id = floor(l_uv);
            vec2 gv = fract(l_uv) - 0.5;
            
            float h = hash(id);
            if(h > 0.98) {
                float size = 0.01 * h;
                float star = smoothstep(size, 0.0, length(gv));
                color += star * uColor * (1.0/i);
            }
        }
        
        float n = sin(uv.x * 2.0 + t) * cos(uv.y * 2.0 - t);
        color += uColor * n * 0.1;
        
        gl_FragColor = vec4(color, length(color) * 0.5);
    }
`

export const initShader = (gl: WebGLRenderingContext, source: string, type: number) => {
    const shader = gl.createShader(type)
    if (!shader) return null
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
    }
    return shader
}

export const createProgram = (gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) => {
    const vertexShader = initShader(gl, vertexSource, gl.VERTEX_SHADER)
    const fragmentShader = initShader(gl, fragmentSource, gl.FRAGMENT_SHADER)
    if (!vertexShader || !fragmentShader) return null

    const program = gl.createProgram()
    if (!program) return null
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program))
        return null
    }
    return program
}
