import MotionImage from '@/components/animate/motion-image';

type Props = {
    image: string;
    name: string;
};

export default function ProductCard({ image, name }: Props) {
    return (
        <div className="overflow-hidden rounded-lg border bg-white">
            <MotionImage
                src={image}
                alt={name}
                className="h-64 w-full object-cover"
            />

            <div className="p-4">
                <h3 className="font-medium text-gray-900">{name}</h3>
            </div>
        </div>
    );
}
