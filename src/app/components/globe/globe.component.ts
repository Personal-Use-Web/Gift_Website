import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
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

    constructor(private cdr: ChangeDetectorRef) { }

    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private controls!: OrbitControls;
    private animationId: number | null = null;
    private stars!: THREE.Points;
    private meshes: THREE.Mesh[] = [];
    private videoElements: HTMLVideoElement[] = [];
    isLoading = true;

    // Media assets
    private images = [
        "IMG-20251005-WA0049.jpg", "IMG-20251026-WA0004.jpg", "IMG-20251214-WA0011.jpg",
        "IMG20250607144431.jpg", "IMG20250607144444.jpg", "IMG20250607181945.jpg",
        "IMG20250615120404.jpg", "IMG20250615173543.jpg", "IMG20250615173631.jpg",
        "IMG20250806175303.jpg", "IMG20250806175327.jpg", "IMG20250809164601.jpg",
        "IMG20250906153653.jpg", "IMG20250922182712.jpg", "IMG20251020190700.jpg",
        "IMG20251213174333.jpg", "IMG20251213181206.jpg", "IMG20251213182533.jpg",
        "IMG20251213183332.jpg", "IMG20251220114047.jpg", "IMG20251220131257.jpg",
        "IMG20251220131320.jpg", "IMG20260119211319.jpg", "IMG_20250609_120312_381.webp",
        "IMG_20250720_224945.jpg", "IMG_20250828_202556_072.jpg", "Snapchat-1591674212.jpg",
        "Snapchat-1661921796.jpg", "Snapchat-1672494589.jpg", "Snapchat-1819021966.jpg",
        "Snapchat-2040014620.jpg", "Snapchat-643802445.jpg", "Snapchat-863412606.jpg",
        "Snapchat-868562493.jpg", "Snapchat-980523949.jpg"
    ].map(name => `/globe/${name}`);

    private videos = [
        "Snapchat-1153215236.mp4", "Snapchat-470849482.mp4", "Snapchat-771002106.mp4",
        "Snapchat-898557678.mp4", "Snapchat-920789537.mp4", "VID-20250711-WA0001.mp4",
        "VID20250806175421.mp4", "VID20251220123943.mp4", "VID_20260214143741.mp4"
    ].map(name => `/globe/${name}`);

    private totalMedia = [...this.images, ...this.videos];

    ngAfterViewInit(): void {
        this.initThree();
        this.createGlobe();
        this.createStars();
        this.animate();

        window.addEventListener('resize', this.onResize.bind(this));
    }

    ngOnDestroy(): void {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        window.removeEventListener('resize', this.onResize.bind(this));

        // Cleanup
        this.meshes.forEach(mesh => {
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material instanceof THREE.Material) mesh.material.dispose();
        });

        if (this.renderer) this.renderer.dispose();

        this.videoElements.forEach(v => {
            v.pause();
            v.remove();
        });
        this.videoElements = [];
    }

    private initThree() {
        const canvas = this.canvasRef.nativeElement;
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.002);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 20;

        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.controls = new OrbitControls(this.camera, canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.8;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 100;

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 2, 100);
        pointLight.position.set(10, 10, 10);
        this.scene.add(pointLight);
    }

    private createGlobe() {
        const count = 50;
        const globeRadius = 12;

        const loadingManager = new THREE.LoadingManager();
        const loader = new THREE.TextureLoader(loadingManager);
        const videoPromises: Promise<void>[] = [];

        const checkFinished = () => {
            Promise.all(videoPromises).then(() => {
                this.isLoading = false;
                this.cdr.detectChanges();
            }).catch(() => {
                this.isLoading = false;
                this.cdr.detectChanges();
            });
        };

        loadingManager.onLoad = () => {
            checkFinished();
        };

        loadingManager.onError = (url) => {
            console.error('There was an error loading ' + url);
            checkFinished();
        };

        // Safety timeout: remove loader after 12 seconds no matter what
        setTimeout(() => {
            if (this.isLoading) {
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        }, 12000);

        for (let i = 0; i < count; i++) {
            const phi = Math.acos(1 - 2 * (i + 0.5) / count);
            const theta = Math.PI * (1 + 5 ** 0.5) * (i + 0.5);

            const x = globeRadius * Math.cos(theta) * Math.sin(phi);
            const y = globeRadius * Math.sin(theta) * Math.sin(phi);
            const z = globeRadius * Math.cos(phi);

            const mediaIndex = i % this.totalMedia.length;
            const mediaSrc = this.totalMedia[mediaIndex];
            const isVideo = mediaSrc.endsWith('.mp4');

            if (isVideo) {
                const videoEl = document.createElement('video');
                videoEl.src = mediaSrc;
                videoEl.loop = true;
                videoEl.muted = true;
                videoEl.playsInline = true;
                videoEl.crossOrigin = "anonymous";

                const videoReady = new Promise<void>((resolve) => {
                    videoEl.oncanplaythrough = () => resolve();
                    videoEl.onerror = () => resolve(); // Skip erroring videos
                    setTimeout(resolve, 6000); // 6s per video timeout
                });
                videoPromises.push(videoReady);

                videoEl.play().catch(e => {
                    console.warn("Video play failed", e);
                });

                this.videoElements.push(videoEl);

                const videoTexture = new THREE.VideoTexture(videoEl);
                videoTexture.colorSpace = THREE.SRGBColorSpace;

                this.createMesh(x, y, z, videoTexture, 16 / 9);
            } else {
                loader.load(mediaSrc, (texture) => {
                    texture.colorSpace = THREE.SRGBColorSpace;
                    const aspect = texture.image.width / texture.image.height;
                    this.createMesh(x, y, z, texture, aspect);
                }, undefined, (err) => {
                    console.error("Error loading texture:", mediaSrc, err);
                });
            }
        }

        if (this.images.length === 0) {
            checkFinished();
        }
    }

    private createMesh(x: number, y: number, z: number, texture: THREE.Texture, aspect: number) {
        // Base size logic: constrain max dimension to ~3 units
        let width, height;
        const scaleFactor = 3.5;

        if (aspect > 1) {
            width = scaleFactor;
            height = scaleFactor / aspect;
        } else {
            height = scaleFactor;
            width = scaleFactor * aspect;
        }

        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.lookAt(0, 0, 0); // Face center

        // Flip to face outward correctly since we are "outside" looking in? 
        // Actually lookAt(0,0,0) makes back face outwards. 
        // We want front face outward.
        mesh.lookAt(new THREE.Vector3(0, 0, 0));
        // Fix orientation: rotate 180 on Y to face outward if needed, or just use DoubleSide (handled).

        // Add local random tilt
        mesh.rotateZ((Math.random() - 0.5) * 0.5);

        this.scene.add(mesh);
        this.meshes.push(mesh);
    }

    private createStars() {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];

        for (let i = 0; i < 3000; i++) {
            const r = 100 + Math.random() * 100; // Distance
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            vertices.push(x, y, z);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2, transparent: true, opacity: 0.6 });
        this.stars = new THREE.Points(geometry, material);
        this.scene.add(this.stars);
    }

    private animate() {
        this.animationId = requestAnimationFrame(this.animate.bind(this));
        this.controls.update();

        // Rotate scene slightly
        if (this.scene) {
            this.scene.rotation.y += 0.001;
        }

        // Make meshes always face the camera (Billboarding) - Optional?
        // No, user wants a globe, so they should be fixed on the sphere surface.

        this.renderer.render(this.scene, this.camera);
    }

    private onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
