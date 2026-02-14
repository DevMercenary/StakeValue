"use client";

import { useEffect, useRef, useCallback } from "react";

interface Coin {
	x: number;
	y: number;
	vx: number;
	vy: number;
	size: number;
	rotation: number;
	rotationSpeed: number;
	tiltAngle: number;
	opacity: number;
	wobble: number;
	wobbleSpeed: number;
	wobblePhase: number;
	baseY: number;
}

function drawCoin(
	ctx: CanvasRenderingContext2D,
	coin: Coin,
	sprite: HTMLImageElement,
	mouseX: number,
	mouseY: number,
) {
	const { x, y, size, rotation, tiltAngle } = coin;

	// Mouse proximity effect — coins push away from cursor
	const dx = x - mouseX;
	const dy = y - mouseY;
	const dist = Math.sqrt(dx * dx + dy * dy);
	const influence = Math.max(0, 1 - dist / 180);
	const pushX = influence * dx * 0.08;
	const pushY = influence * dy * 0.08;
	const drawX = x + pushX;
	const drawY = y + pushY;

	// Scale boost near mouse
	const scaleBoost = 1 + influence * 0.25;
	const drawSize = size * scaleBoost;

	// 3D spin — squash horizontally to simulate perspective rotation
	const squash = 0.3 + Math.abs(Math.cos(rotation)) * 0.7;

	ctx.save();
	ctx.translate(drawX, drawY);
	ctx.rotate(tiltAngle);
	ctx.scale(squash, 1);
	ctx.globalAlpha = coin.opacity;

	// Draw the PNG sprite centered
	const half = drawSize;
	ctx.drawImage(sprite, -half, -half, half * 2, half * 2);

	ctx.restore();
}

interface FloatingCoinsProps {
	count?: number;
	className?: string;
	fullscreen?: boolean;
}

export const FloatingCoins = ({
	count = 24,
	className,
	fullscreen = false,
}: FloatingCoinsProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const mouseRef = useRef({ x: -1000, y: -1000 });
	const containerRef = useRef<HTMLDivElement>(null);

	const handleMouseMove = useCallback((e: MouseEvent) => {
		const container = containerRef.current;
		if (!container) return;
		const rect = container.getBoundingClientRect();
		mouseRef.current = {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		};
	}, []);

	const handleMouseLeave = useCallback(() => {
		mouseRef.current = { x: -1000, y: -1000 };
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		const container = containerRef.current;
		if (!canvas || !container) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Load PNG sprite
		const sprite = new Image();
		sprite.src = "/btc-coin.png";

		const resize = () => {
			const rect = container.getBoundingClientRect();
			canvas.width = rect.width;
			canvas.height = rect.height;
		};
		resize();
		window.addEventListener("resize", resize);
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseleave", handleMouseLeave);

		const coins: Coin[] = Array.from({ length: count }, () => {
			const y = Math.random() * canvas.height;
			return {
				x: Math.random() * canvas.width,
				y,
				baseY: y,
				vx: (Math.random() - 0.5) * 0.4,
				vy: 0,
				size: Math.random() * 8 + 8,
				rotation: Math.random() * Math.PI * 2,
				rotationSpeed: (Math.random() - 0.5) * 0.02,
				tiltAngle: Math.random() * Math.PI * 2,
				opacity: Math.random() * 0.35 + 0.15,
				wobble: Math.random() * 15 + 5,
				wobbleSpeed: Math.random() * 0.008 + 0.005,
				wobblePhase: Math.random() * Math.PI * 2,
			};
		});

		let time = 0;
		let animationId: number;

		const animate = () => {
			time++;
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Only draw once sprite is loaded
			if (sprite.complete && sprite.naturalWidth > 0) {
				for (const coin of coins) {
					// Floating wobble
					coin.y =
						coin.baseY +
						Math.sin(
							time * coin.wobbleSpeed + coin.wobblePhase,
						) * coin.wobble;

					// Slow horizontal drift
					coin.x += coin.vx;
					coin.rotation += coin.rotationSpeed;

					// Wrap around
					if (coin.x < -30) coin.x = canvas.width + 30;
					if (coin.x > canvas.width + 30) coin.x = -30;

					drawCoin(
						ctx,
						coin,
						sprite,
						mouseRef.current.x,
						mouseRef.current.y,
					);
				}
			}

			animationId = requestAnimationFrame(animate);
		};
		animate();

		return () => {
			cancelAnimationFrame(animationId);
			window.removeEventListener("resize", resize);
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseleave", handleMouseLeave);
		};
	}, [count, handleMouseMove, handleMouseLeave]);

	return (
		<div
			ref={containerRef}
			className={`${fullscreen ? "fixed" : "absolute"} inset-0 overflow-hidden pointer-events-none ${className ?? ""}`}
			style={{ zIndex: 0 }}
		>
			<canvas
				ref={canvasRef}
				className="absolute inset-0"
				aria-hidden="true"
			/>
		</div>
	);
};
