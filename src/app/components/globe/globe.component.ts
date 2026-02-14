import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
    selector: 'app-globe',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './globe.component.html',
    styleUrls: ['./globe.component.css']
})
export class GlobeComponent implements AfterViewInit, OnDestroy {
    @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
    @Output() restart = new EventEmitter<void>();

    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private controls!: OrbitControls;
    private animationId: number | null = null;
    private stars!: THREE.Points;

    ngAfterViewInit(): void {
        this.initThree();
        this.createGlobe();
        this.createStars();
        this.animate();

        // Handle Window Resize
        window.addEventListener('resize', this.onResize.bind(this));
    }

    ngOnDestroy(): void {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        window.removeEventListener('resize', this.onResize.bind(this));
        // Cleanup Three.js resources if needed
        if (this.renderer) this.renderer.dispose();
    }

    private initThree() {
        const canvas = this.canvasRef.nativeElement;
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.002); // Add fog for depth

        // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 20;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // Controls
        this.controls = new OrbitControls(this.camera, canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;

        // Allow zooming inside
        this.controls.minDistance = 0.1;
        this.controls.maxDistance = 100;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 2); // Soft white light
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 2, 100);
        pointLight.position.set(10, 10, 10);
        this.scene.add(pointLight);
    }

    private createGlobe() {
        // We'll create a sphere of "images" (planes)
        // For now, using colored planes as placeholders

        const count = 50; // Number of image panels
        const globeRadius = 10;

        for (let i = 0; i < count; i++) {
            const phi = Math.acos(-1 + (2 * i) / count);
            const theta = Math.sqrt(count * Math.PI) * phi;

            const x = globeRadius * Math.cos(theta) * Math.sin(phi);
            const y = globeRadius * Math.sin(theta) * Math.sin(phi);
            const z = globeRadius * Math.cos(phi);

            // Create a plane memory card
            const geometry = new THREE.PlaneGeometry(3, 2);
            // Random color for placeholder
            const color = new THREE.Color().setHSL(Math.random(), 0.7, 0.5);
            const material = new THREE.MeshBasicMaterial({
                color: color,
                side: THREE.DoubleSide // Visible from inside and outside
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(x, y, z);
            mesh.lookAt(0, 0, 0); // Look at center

            // Add random slight rotation for variety
            mesh.rotateZ(Math.random() * 0.5);

            this.scene.add(mesh);
        }
    }

    private createStars() {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];

        for (let i = 0; i < 2000; i++) {
            const x = (Math.random() - 0.5) * 200;
            const y = (Math.random() - 0.5) * 200;
            const z = (Math.random() - 0.5) * 200;
            vertices.push(x, y, z);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, transparent: true, opacity: 0.8 });
        this.stars = new THREE.Points(geometry, material);
        this.scene.add(this.stars);
    }

    private animate() {
        this.animationId = requestAnimationFrame(this.animate.bind(this));

        this.controls.update();

        // Slow star rotation
        if (this.stars) {
            this.stars.rotation.y += 0.0005;
        }

        this.renderer.render(this.scene, this.camera);
    }

    private onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
