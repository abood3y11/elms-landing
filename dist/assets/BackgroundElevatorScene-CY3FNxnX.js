import{j as e,r as o}from"./index-JJoLa8UX.js";import{s as u,C as a,q as i,r as l}from"./react-three-fiber.esm-I4LweltO.js";function m(){const t=o.useRef(null),s=o.useMemo(()=>({uTime:{value:0},uColorA:{value:new a("#0f766e")},uColorB:{value:new a("#102331")}}),[]);return i(({clock:r})=>{t.current&&(t.current.uniforms.uTime.value=r.getElapsedTime())}),e.jsxs("mesh",{position:[0,0,-2.2],scale:[8.5,5.2,1],children:[e.jsx("planeGeometry",{args:[1,1,80,80]}),e.jsx("shaderMaterial",{ref:t,transparent:!0,depthWrite:!1,uniforms:s,vertexShader:`
          varying vec2 vUv;
          uniform float uTime;
          void main() {
            vUv = uv;
            vec3 p = position;
            p.z += sin((p.x + uTime * 0.18) * 8.0) * 0.018;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `,fragmentShader:`
          varying vec2 vUv;
          uniform float uTime;
          uniform vec3 uColorA;
          uniform vec3 uColorB;
          float line(float value, float width) {
            return smoothstep(width, 0.0, abs(fract(value) - 0.5));
          }
          void main() {
            float vertical = line(vUv.x * 9.0, 0.018);
            float floors = line((vUv.y + uTime * 0.025) * 7.0, 0.012);
            float glow = smoothstep(0.75, 0.2, distance(vUv, vec2(0.52, 0.48)));
            vec3 color = mix(uColorB, uColorA, glow * 0.45 + vertical * 0.18 + floors * 0.12);
            float alpha = 0.18 + glow * 0.2 + vertical * 0.06 + floors * 0.05;
            gl_FragColor = vec4(color, alpha);
          }
        `})]})}function d(){const t=o.useRef(null),s=o.useRef(0);return o.useEffect(()=>{const r=()=>{const n=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);s.current=window.scrollY/n};return r(),window.addEventListener("scroll",r,{passive:!0}),window.addEventListener("resize",r),()=>{window.removeEventListener("scroll",r),window.removeEventListener("resize",r)}},[]),i(({clock:r})=>{const n=r.getElapsedTime();if(t.current){const c=l.lerp(1.85,-1.85,s.current);t.current.position.y=c+Math.sin(n*.35)*.18,t.current.rotation.y=Math.sin(n*.18)*.12}}),e.jsxs("group",{ref:t,position:[2.55,-.2,-.85],rotation:[0,-.28,0],children:[e.jsxs("mesh",{children:[e.jsx("boxGeometry",{args:[.8,1.25,.52]}),e.jsx("meshStandardMaterial",{color:"#d8edf0",metalness:.55,roughness:.28,transparent:!0,opacity:.22})]}),e.jsxs("mesh",{position:[0,0,.27],children:[e.jsx("boxGeometry",{args:[.62,1.02,.025]}),e.jsx("meshStandardMaterial",{color:"#0f766e",emissive:"#0f766e",emissiveIntensity:.28,transparent:!0,opacity:.26})]})]})}function v(){const t=o.useRef(null),s=o.useRef(0);return o.useEffect(()=>{const r=()=>{const n=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);s.current=window.scrollY/n};return r(),window.addEventListener("scroll",r,{passive:!0}),window.addEventListener("resize",r),()=>{window.removeEventListener("scroll",r),window.removeEventListener("resize",r)}},[]),i(()=>{t.current&&(t.current.position.y=l.lerp(.35,-.35,s.current))}),e.jsxs("group",{ref:t,position:[2.55,-.2,-1.05],rotation:[0,-.28,0],children:[[-.55,.55].map(r=>e.jsxs("mesh",{position:[r,0,0],children:[e.jsx("boxGeometry",{args:[.035,5.8,.035]}),e.jsx("meshStandardMaterial",{color:"#139884",transparent:!0,opacity:.2})]},r)),[-2.4,-1.6,-.8,0,.8,1.6,2.4].map(r=>e.jsxs("mesh",{position:[0,r,0],children:[e.jsx("boxGeometry",{args:[1.35,.025,.025]}),e.jsx("meshStandardMaterial",{color:"#102331",transparent:!0,opacity:.18})]},r))]})}function h(){return e.jsxs(u,{dpr:[1,1.4],camera:{position:[0,0,5.8],fov:42},gl:{alpha:!0,antialias:!0},children:[e.jsx("ambientLight",{intensity:.8}),e.jsx("directionalLight",{position:[3,4,5],intensity:1.4}),e.jsx("pointLight",{position:[-2.5,1.5,2],intensity:3,color:"#d99a24"}),e.jsx(m,{}),e.jsx(v,{}),e.jsx(d,{})]})}export{h as default};
