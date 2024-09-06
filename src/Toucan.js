import React, { useRef, useEffect } from 'react';
import './css/App.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import toucanModel from './model/toucan.glb';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import TV from './tv.js'

const hdri = new URL("./model/environment.hdr", import.meta.url);

function App() {
  const mountRef = useRef(null);
  const modelRef = useRef(null);  // Reference to the model
  const targetRotation = useRef({ x: 0, y: 0 }); // Target rotation for easing

  useEffect(() => {
    // Three.js scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0.5, 5);

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    // Load environment texture
    const Env = new RGBELoader();
    Env.load(hdri, function (texture) {
      texture.mapping = THREE.EquirectangularRefractionMapping;
      scene.environment = texture;
    });

    // Add lights to illuminate the model's faces
    const light1 = new THREE.DirectionalLight(0xf18f0f, 10);
    light1.position.set(2, 0, 0);  // Position the light on one side
    scene.add(light1);

    const light2 = new THREE.DirectionalLight(0xf18f0f, 10);
    light2.position.set(-2, 0, 0);  // Position the light on the opposite side
    scene.add(light2);

    // Load model
    const loader = new GLTFLoader();
    loader.load(toucanModel, function (gltf) {
      const model = gltf.scene;
      model.scale.set(1.25, 1.25, 1.25);

      model.traverse((child) => {
        if (child.isMesh) {
          const material = child.material;
          material.metalness = 1.0;
          material.roughness = 0.1;
          material.needsUpdate = true;
        }
      });

      scene.add(model);
      modelRef.current = model;  // Save the model reference
    }, undefined, function (error) {
      console.error(error);
    });

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    const handleMouseMove = (event) => {
      const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

      targetRotation.current.y = (mouseX / 4) * Math.PI;
      targetRotation.current.x = (-mouseY / 4) * Math.PI / 2;
    };

    const handleTouchMove = (event) => {
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        const touchX = (touch.clientX / window.innerWidth) * 2 - 1;
        const touchY = -(touch.clientY / window.innerHeight) * 2 + 1;

        targetRotation.current.y = (touchX / 4) * Math.PI;
        targetRotation.current.x = (-touchY / 4) * Math.PI / 2;
      }
    };


    let lastScrollY = 0;
    let ticking = false;
  
    const handleScroll = () => {
      // L'utilisateur fait défiler vers le bas ou vers le haut
      const scrollY = window.scrollY;
  
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentViewportHeight = window.innerHeight;
  
          // Calculer si l'on défile vers le haut ou le bas
          if (scrollY > lastScrollY) {
            // Défilement vers le bas - aller à la prochaine section
            window.scrollTo({
              top: Math.ceil(scrollY / currentViewportHeight) * currentViewportHeight,
              behavior: 'smooth'
            });
          } else {
            // Défilement vers le haut - revenir à la section précédente
            window.scrollTo({
              top: Math.floor(scrollY / currentViewportHeight) * currentViewportHeight,
              behavior: 'smooth'
            });
          }
  
          lastScrollY = scrollY;
          ticking = false;
        });
  
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    const animate = () => {
      requestAnimationFrame(animate);

      if (modelRef.current) {
        modelRef.current.rotation.y += (targetRotation.current.y - modelRef.current.rotation.y) * 0.05;
        modelRef.current.rotation.x += (targetRotation.current.x - modelRef.current.rotation.x) * 0.05;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);
  
  const handleClick = () => {
    const currentScrollY = window.scrollY;
    const viewportHeight = window.innerHeight;

    // Faire défiler de 100vh vers le bas
    window.scrollTo({
      top: currentScrollY + viewportHeight,
      behavior: 'smooth', // Pour un défilement fluide
    });
  }

  return (
    <>
    <div className='mainDiv'>
      <div className='Tdiv' ref={mountRef} />
      <div className='background-text' style={{display: "inline-block"}}>Votez osilys</div>
      <div className='background-text background-text-delay' style={{display: "inline-block"}}>Votez osilys</div>
      <main>
        <div className="welcome">
          <div className="left"><a className="btn btn--big" id="btn-discover" href="#"><span>Bouton 1</span></a></div>
          <div className='center'></div>
          <div className="right"><button className="btn btn--big" id="btn-booknow" onClick={handleClick}><span>Bouton 2</span></button></div>
        </div>
      </main>
    </div>
    <TV />
    </>
  );
}

export default App;