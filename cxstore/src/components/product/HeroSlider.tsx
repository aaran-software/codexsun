import { useEffect, useState, useCallback } from "react"
import { StarIcon, ShoppingCartIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Link } from "react-router-dom"
import useEmblaCarousel from "embla-carousel-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const featuredProducts = [
  {
    id: 1,
    title: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
    price: "$348.00",
    rating: "4.9",
    category: "Electronics",
    description: "Industry-leading noise cancellation. Exceptional sound quality with newly developed drivers. Up to 30 hours of battery life with quick charging.",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&h=800&fit=crop&q=80",
    bgColor: "bg-[linear-gradient(135deg,#1f140f_0%,#5d241a_48%,#c88638_100%)]",
  },
  {
    id: 2,
    title: "Apple Watch Series 9 GPS + Cellular",
    price: "$399.00",
    rating: "5.0",
    category: "Electronics",
    description: "The most powerful chip in Apple Watch ever. A magical new way to use your watch without touching the screen. Advanced health sensors.",
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&h=800&fit=crop&q=80",
    bgColor: "bg-[linear-gradient(135deg,#111827_0%,#1e3a8a_48%,#3b82f6_100%)]", // Blue tone
  },
  {
    id: 3,
    title: "Premium Minimalist Leather Travel Backpack",
    price: "$125.00",
    rating: "4.9",
    category: "Accessories",
    description: "Crafted from full-grain leather. Features a padded laptop sleeve, multiple organizational pockets, and ergonomic shoulder straps for all-day comfort.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop&q=80",
    bgColor: "bg-[linear-gradient(135deg,#064e3b_0%,#047857_48%,#10b981_100%)]", // Green tone
  },
]

export function HeroSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi, setSelectedIndex])

  useEffect(() => {
    if (!emblaApi) return
    
    // Auto-advance
    const autoPlayInterval = setInterval(() => {
      emblaApi.scrollNext()
    }, 6000)

    onSelect()
    emblaApi.on("select", onSelect)
    
    return () => {
      clearInterval(autoPlayInterval)
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi, onSelect])

  return (
    <section className={cn(
      "relative overflow-hidden rounded-[2.5rem] border border-border/60 text-white shadow-[0_35px_90px_-42px_rgba(49,20,9,0.72)] transition-colors duration-700 ease-in-out",
      featuredProducts[selectedIndex]?.bgColor || "bg-[linear-gradient(135deg,#1f140f_0%,#5d241a_48%,#c88638_100%)]"
    )}>
      {/* Decorative background radial gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {featuredProducts.map((product) => (
              <div key={product.id} className="min-w-0 flex-[0_0_100%]">
                <div className="flex flex-col-reverse items-center justify-between gap-6 px-6 py-6 sm:px-10 sm:py-8 md:flex-row md:gap-10">
                  
                  {/* Left Content Area */}
                  <div className="flex w-full flex-1 flex-col justify-center space-y-4 md:w-1/2 md:space-y-5">
                    <div className="inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
                      {product.category}
                    </div>
                    
                    <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl lg:text-5xl lg:leading-[1.1]">
                      {product.title}
                    </h1>
                    
                    <p className="max-w-xl text-xs leading-relaxed text-white/80 sm:text-sm md:text-base">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center gap-5 pt-1">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-white/60">Special Price</span>
                        <span className="text-2xl font-bold text-white sm:text-3xl">{product.price}</span>
                      </div>
                      <div className="h-8 w-px bg-white/20" />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-white/60">Rating & Reviews</span>
                        <div className="flex items-center gap-1.5 text-yellow-500">
                          <StarIcon className="size-4 fill-current sm:size-5" />
                          <span className="text-base font-bold text-white sm:text-lg">{product.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Button className="h-10 rounded-full bg-white px-6 text-sm font-semibold text-black hover:bg-white/90 sm:h-11 sm:px-8 sm:text-base">
                        <ShoppingCartIcon className="mr-2 size-4 sm:size-5" />
                        Add to Cart
                      </Button>
                      <Link to={`/product/${product.id}`} className={buttonVariants({ variant: "outline", className: "h-10 rounded-full border-white/20 bg-transparent px-6 text-sm font-medium text-white hover:bg-white/10 sm:h-11 sm:px-8 sm:text-base" })}>
                        View Details
                      </Link>
                    </div>
                  </div>

                  {/* Right Image Area */}
                  <div className="relative flex w-full flex-1 touch-pan-y items-center justify-center md:w-1/2">
                    <div className="relative aspect-[4/3] w-full max-w-[320px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-md lg:aspect-square lg:max-w-[420px]">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Controls */}
        <div className="absolute bottom-6 right-6 flex items-center gap-3 sm:bottom-10 sm:right-10 md:bottom-12 md:right-12">
          <Button
            variant="outline"
            size="icon"
            onClick={scrollPrev}
            className="size-10 rounded-full border-white/20 bg-black/20 text-white backdrop-blur-md hover:bg-black/40 hover:text-white"
          >
            <ChevronLeftIcon className="size-5" />
          </Button>
          <div className="flex items-center gap-1.5 px-2">
            {featuredProducts.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === selectedIndex ? "w-6 bg-white" : "w-1.5 bg-white/30"
                )}
              />
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            className="size-10 rounded-full border-white/20 bg-black/20 text-white backdrop-blur-md hover:bg-black/40 hover:text-white"
          >
            <ChevronRightIcon className="size-5" />
          </Button>
        </div>
      </div>
    </section>
  )
}
