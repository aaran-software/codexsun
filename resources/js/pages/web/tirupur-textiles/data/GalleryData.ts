export type GalleryItem = {
    src: string;
    alt: string;
    className?: string;
};

export type BrandGallery = {
    slug: string;
    title: string;
    tagline: string;
    coverImage: string;
    hero: {
        title: string;
        description: string;
        background: string;
    };
    items: GalleryItem[];
};
export const galleryData: BrandGallery[] = [
    {
        slug: "arrow",
        title: "Arrow",
        tagline: "Sharp formalwear for the modern professional",
        coverImage: "/assets/hero.jpg",

        hero: {
            title: "Arrow Fashion Collection",
            description:
                "Explore Arrow’s premium shirts and trousers designed for comfort, elegance, and everyday professionalism.",
            background: "/assets/hero.jpg",
        },

        items: [
            {
                src: "/assets/hero.jpg",
                alt: "Arrow formal shirts collection",
                className: "col-span-2 row-span-20",
            },
            {
                src: "/assets/hero.jpg",
                alt: "Arrow premium trousers collection",
                className: "col-span-2 row-span-15",
            },
        ],
    },

    {
        slug: "peter-england",
        title: "Peter England",
        tagline: "Classic styles for every occasion",
        coverImage: "/assets/hero.jpg",

        hero: {
            title: "Peter England Apparel",
            description:
                "Discover timeless shirts and pants from Peter England, crafted for work, weddings, and casual elegance.",
            background: "/assets/hero.jpg",
        },

        items: [
            {
                src: "/assets/hero.jpg",
                alt: "Peter England men's shirt collection",
                className: "col-span-2 row-span-20",
            },
            {
                src: "/assets/hero.jpg",
                alt: "Peter England trousers and chinos",
                className: "col-span-2 row-span-15",
            },
        ],
    },

    {
        slug: "louis-philippe",
        title: "Louis Philippe",
        tagline: "Premium menswear with refined elegance",
        coverImage: "/assets/hero.jpg",

        hero: {
            title: "Louis Philippe Menswear",
            description:
                "Experience luxury shirts and trousers from Louis Philippe, tailored for sophisticated style.",
            background: "/assets/hero.jpg",
        },

        items: [
            {
                src: "/assets/hero.jpg",
                alt: "Louis Philippe formal shirts",
                className: "col-span-2 row-span-20",
            },
            {
                src: "/assets/hero.jpg",
                alt: "Louis Philippe tailored pants",
                className: "col-span-2 row-span-15",
            },
        ],
    },

    {
        slug: "van-heusen",
        title: "Van Heusen",
        tagline: "Power dressing redefined",
        coverImage: "/assets/hero.jpg",

        hero: {
            title: "Van Heusen Collection",
            description:
                "Shop modern shirts and trousers from Van Heusen, blending style, comfort, and confidence.",
            background: "/assets/hero.jpg",
        },

        items: [
            {
                src: "/assets/hero.jpg",
                alt: "Van Heusen formal shirts",
                className: "col-span-2 row-span-20",
            },
            {
                src: "/assets/hero.jpg",
                alt: "Van Heusen slim-fit trousers",
                className: "col-span-2 row-span-15",
            },
        ],
    },
];
