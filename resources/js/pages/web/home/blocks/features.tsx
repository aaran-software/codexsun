type Feature = {
    title: string;
    description: string;
};

type Props = {
    features: Feature[];
};

export default function Features({ features }: Props) {
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
                <div key={index} className="rounded-lg border bg-white p-6">
                    <h3 className="mb-2 font-semibold text-gray-900">
                        {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                        {feature.description}
                    </p>
                </div>
            ))}
        </div>
    );
}
