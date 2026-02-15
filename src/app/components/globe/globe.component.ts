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
    private meshes: THREE.Object3D[] = [];

    private textureCache = new Map<string, THREE.Texture>();
    private videoCache = new Map<string, { element: HTMLVideoElement, texture: THREE.VideoTexture }>();
    private loadPromises = new Map<string, Promise<THREE.Texture>>();

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
        this.createCore();
        this.createGlobe();
        this.createStars();
        this.animate();

        window.addEventListener('resize', this.onResize.bind(this));
    }

    ngOnDestroy(): void {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        window.removeEventListener('resize', this.onResize.bind(this));

        // Cleanup Meshes & Textures
        this.meshes.forEach(obj => {
            if (obj instanceof THREE.Group) {
                obj.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        if (child.geometry) child.geometry.dispose();
                        if (child.material instanceof THREE.Material) child.material.dispose();
                    }
                });
            }
        });

        if (this.renderer) this.renderer.dispose();

        // Cleanup Videos
        this.videoCache.forEach(({ element, texture }) => {
            element.pause();
            element.remove();
            texture.dispose();
        });
        this.videoCache.clear();

        this.textureCache.forEach(texture => texture.dispose());
        this.textureCache.clear();
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
        this.controls.autoRotateSpeed = 0.5;
        this.controls.minDistance = 15;
        this.controls.maxDistance = 100;

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 2, 100);
        pointLight.position.set(10, 10, 10);
        this.scene.add(pointLight);
    }

    private createCore() {
        // Create a central wireframe sphere to visually connect the items
        const geometry = new THREE.SphereGeometry(11.8, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: 0x444444,
            wireframe: true,
            transparent: true,
            opacity: 0.15
        });
        const sphere = new THREE.Mesh(geometry, material);
        this.scene.add(sphere);
    }

    private async createGlobe() {
        const count = 50;
        const globeRadius = 12;

        for (let i = 0; i < count; i++) {
            // Spherical distribution via Fibonacci sphere algorithm
            const phi = Math.acos(1 - 2 * (i + 0.5) / count);
            const theta = Math.PI * (1 + 5 ** 0.5) * (i + 0.5);

            const x = globeRadius * Math.cos(theta) * Math.sin(phi);
            const y = globeRadius * Math.sin(theta) * Math.sin(phi);
            const z = globeRadius * Math.cos(phi);

            // Pick media cyclically
            const mediaIndex = i % this.totalMedia.length;
            const mediaSrc = this.totalMedia[mediaIndex];
            const isVideo = mediaSrc.endsWith('.mp4');

            try {
                const texture = await this.getTexture(mediaSrc, isVideo);
                texture.colorSpace = THREE.SRGBColorSpace;

                // Determine Aspect Ratio
                let aspect = 1;
                const image: any = texture.image;
                if (isVideo) {
                    const vid = image as HTMLVideoElement;
                    if (vid.videoWidth) {
                        aspect = vid.videoWidth / vid.videoHeight;
                    } else {
                        aspect = 16 / 9;
                    }
                } else {
                    aspect = image.width / image.height;
                }

                this.createMeshGroup(x, y, z, texture, aspect);

            } catch (err) {
                console.error("Failed to load texture for globe item:", mediaSrc, err);
            }
        }
    }

    private getTexture(url: string, isVideo: boolean): Promise<THREE.Texture> {
        if (isVideo) {
            if (this.videoCache.has(url)) {
                return Promise.resolve(this.videoCache.get(url)!.texture);
            }

            return new Promise((resolve) => {
                const video = document.createElement('video');
                video.src = url;
                video.loop = true;
                video.muted = true;
                video.playsInline = true;
                video.crossOrigin = "anonymous";
                video.play().catch(e => console.warn("Video play failed", e));

                const texture = new THREE.VideoTexture(video);
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;

                this.videoCache.set(url, { element: video, texture });
                resolve(texture);
            });
        } else {
            if (this.textureCache.has(url)) {
                return Promise.resolve(this.textureCache.get(url)!);
            }

            return new Promise((resolve, reject) => {
                new THREE.TextureLoader().load(url, (texture) => {
                    this.textureCache.set(url, texture);
                    resolve(texture);
                }, undefined, reject);
            });
        }
    }

    private createMeshGroup(x: number, y: number, z: number, texture: THREE.Texture, aspect: number) {
        // Base size logic
        let width, height;
        const scaleFactor = 4;

        if (aspect > 1) {
            width = scaleFactor;
            height = scaleFactor / aspect;
        } else {
            height = scaleFactor;
            width = scaleFactor * aspect;
        }

        const group = new THREE.Group();
        group.position.set(x, y, z);
        group.lookAt(0, 0, 0);

        // 1. Image Plane
        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 0, 0);

        // 2. Border Plane
        const borderGeo = new THREE.PlaneGeometry(width + 0.2, height + 0.2);
        const borderMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        const borderMesh = new THREE.Mesh(borderGeo, borderMat);
        borderMesh.position.set(0, 0, 0.05);

        group.add(borderMesh);
        group.add(mesh);

        group.rotateZ((Math.random() - 0.5) * 0.2);

        this.scene.add(group);
        this.meshes.push(group);
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
