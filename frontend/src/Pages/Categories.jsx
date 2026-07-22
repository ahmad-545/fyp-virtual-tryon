import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import cata1 from "../assets/cata1.png";
import cata2 from "../assets/cata2.png";
import cata3 from "../assets/cata3.png";

const categories = [
  {
    title: "WOMEN'S WEAR",
    items: "3,268 Items",
    image: cata1,
    category: "women",
    bgColor: "bg-[#dfecef]/70",
  },
  {
    title: "KID'S WEAR",
    items: "8,562 Items",
    image: cata2,
    category: "kids",
    bgColor: "bg-[#f2ece9]/70",
  },
  {
    title: "MEN'S WEAR",
    items: "1,450 Items", // Updated count for a premium brand balance
    image: cata3,
    category: "men",
    bgColor: "bg-[#f2efeb]/70",
  },
];

export default function FashionCategories() {
  return (
    <div className="w-full bg-[#fcfcfc] py-16 px-4 sm:px-6 md:px-10 lg:px-16 select-none">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.32fr_1fr] gap-6">

        {/* 🅰️ LEFT PANEL: FEATURED WOMEN'S WEAR CARD */}
        <Link
          to={`/shop?category=${categories[0].category}`}
          className={`relative overflow-hidden rounded-md ${categories[0].bgColor} h-[460px] lg:h-[520px] group block shadow-[0_4px_25px_rgba(0,0,0,0.02)] transition-all duration-500 hover:shadow-[0_15px_35px_rgba(0,0,0,0.05)]`}
        >
          {/* Absolute Background Image Layout Alignment */}
          <img
            src={categories[0].image}
            alt="Women's Wear Collection"
            className="absolute right-0 bottom-0 h-[90%] md:h-full w-auto object-contain object-bottom transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />

          {/* Text Mask overlay gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {/* Content Wrapper Box */}
          <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col justify-between h-full items-start">
            <div className="space-y-1 md:space-y-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium tracking-tight text-neutral-900">
                {categories[0].title}
              </h2>
              <p className="text-neutral-500 font-mono text-xs md:text-sm tracking-wider uppercase">
                // {categories[0].items}
              </p>
            </div>

            <span className="inline-flex items-center gap-3 border border-neutral-900 bg-transparent text-neutral-950 px-6 py-3 text-xs uppercase tracking-[0.2em] font-mono font-medium rounded-sm transition-all duration-500 ease-in-out group-hover:bg-neutral-950 group-hover:text-white shadow-sm">
              <span>Browse Items</span>
              <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
        </Link>

        {/* 🅱️ RIGHT PANEL: STACKED UTILITY CARDS (KIDS & MEN) */}
        <div className="flex flex-col gap-6 h-full justify-between">

          {/* KIDS WEAR SPLIT BLOCK CONTAINER */}
          <Link
            to={`/shop?category=${categories[1].category}`}
            className={`relative overflow-hidden rounded-md ${categories[1].bgColor} h-[218px] lg:h-[247px] group block shadow-[0_4px_25px_rgba(0,0,0,0.02)] transition-all duration-500 hover:shadow-[0_15px_35px_rgba(0,0,0,0.05)]`}
          >
            <img
              src={categories[1].image}
              alt="Kids Wear Collection"
              className="absolute right-0 bottom-0 h-[95%] w-auto object-contain object-bottom transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />

            <div className="relative z-10 p-6 sm:p-8 flex flex-col justify-between h-full items-start">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-serif font-medium tracking-tight text-neutral-900">
                  {categories[1].title}
                </h2>
                <p className="text-neutral-500 font-mono text-[11px] tracking-wider uppercase">
                  // {categories[1].items}
                </p>
              </div>

              <span className="inline-flex items-center gap-2 border border-neutral-900 bg-transparent text-neutral-950 px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] font-mono font-medium rounded-sm transition-all duration-500 ease-in-out group-hover:bg-neutral-950 group-hover:text-white">
                <span>Browse</span>
                <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

          {/* MEN'S WEAR SPLIT BLOCK CONTAINER */}
          <Link
            to={`/shop?category=${categories[2].category}`}
            className={`relative overflow-hidden rounded-md ${categories[2].bgColor} h-[218px] lg:h-[247px] group block shadow-[0_4px_25px_rgba(0,0,0,0.02)] transition-all duration-500 hover:shadow-[0_15px_35px_rgba(0,0,0,0.05)]`}
          >
            <img
              src={categories[2].image}
              alt="Men's Wear Collection"
              className="absolute right-0 bottom-0 h-[95%] w-auto object-contain object-bottom transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />

            <div className="relative z-10 p-6 sm:p-8 flex flex-col justify-between h-full items-start">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-serif font-medium tracking-tight text-neutral-900">
                  {categories[2].title}
                </h2>
                <p className="text-neutral-500 font-mono text-[11px] tracking-wider uppercase">
                  // {categories[2].items}
                </p>
              </div>

              <span className="inline-flex items-center gap-2 border border-neutral-900 bg-transparent text-neutral-950 px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] font-mono font-medium rounded-sm transition-all duration-500 ease-in-out group-hover:bg-neutral-950 group-hover:text-white">
                <span>Browse</span>
                <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}