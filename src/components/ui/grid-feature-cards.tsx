import { cn } from '@/lib/utils';
import React from 'react';

type FeatureType = {
	title: string;
	icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	step?: string | number;
	description: string;
};

type FeatureCardProps = React.ComponentProps<'div'> & {
	feature: FeatureType;
};

export function FeatureCard({ feature, className, ...props }: FeatureCardProps) {
	const p = React.useMemo(() => genDeterministicPattern(feature.title), [feature.title]);

	return (
		<div className={cn('relative overflow-hidden p-6 bg-transparent', className)} {...props}>
			<div className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 h-full w-full [mask-image:linear-gradient(white,transparent)]">
				<div className="absolute inset-0 [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] opacity-70">
					<GridPattern
						width={20}
						height={20}
						x="-12"
						y="4"
						squares={p}
						className="fill-white/[0.04] stroke-white/15 absolute inset-0 h-full w-full"
					/>
				</div>
			</div>
			{feature.step ? (
				<div className="flex size-7 items-center justify-center rounded-lg bg-white/10 border border-white/15 text-white font-mono text-xs font-bold shadow-sm relative z-20">
					{feature.step}
				</div>
			) : feature.icon ? (
				<feature.icon className="text-zinc-300 size-6 relative z-20" strokeWidth={1.5} aria-hidden />
			) : null}
			<h3 className="mt-8 text-sm md:text-base font-semibold text-white tracking-tight relative z-20">{feature.title}</h3>
			<p className="text-zinc-400 relative z-20 mt-2 text-xs font-normal leading-relaxed">{feature.description}</p>
		</div>
	);
}

function GridPattern({
	width,
	height,
	x,
	y,
	squares,
	...props
}: React.ComponentProps<'svg'> & { width: number; height: number; x: string; y: string; squares?: number[][] }) {
	const patternId = React.useId();

	return (
		<svg aria-hidden="true" {...props}>
			<defs>
				<pattern id={patternId} width={width} height={height} patternUnits="userSpaceOnUse" x={x} y={y}>
					<path d={`M.5 ${height}V.5H${width}`} fill="none" />
				</pattern>
			</defs>
			<rect width="100%" height="100%" strokeWidth={0} fill={`url(#${patternId})`} />
			{squares && (
				<svg x={x} y={y} className="overflow-visible">
					{squares.map(([x, y], index) => (
						<rect strokeWidth="0" key={index} width={width + 1} height={height + 1} x={x * width} y={y * height} />
					))}
				</svg>
			)}
		</svg>
	);
}

function genDeterministicPattern(seed: string, length = 5): number[][] {
	let hash = 0;
	for (let i = 0; i < seed.length; i++) {
		hash = (hash << 5) - hash + seed.charCodeAt(i);
		hash |= 0;
	}
	const absHash = Math.abs(hash);
	return Array.from({ length }, (_, i) => [
		((absHash + i * 7) % 4) + 7,  // deterministic x between 7 and 10
		((absHash + i * 13) % 6) + 1, // deterministic y between 1 and 6
	]);
}
