"use client";

import React from "react";

const categories = ["All", "Breakfast", "Burgers", "Pizza", "Chicken", "Pasta", "Drinks", "Desserts"];

const popularItems = [
  {
    id: 1,
    name: "Classic Beef Burger",
    description: "Juicy beef patty with cheddar, lettuce, tomato and house sauce.",
    price: 850,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
  },
  {
    id: 2,
    name: "Creamy Chicken Pasta",
    description: "Tender grilled chicken with creamy Alfredo sauce and parmesan.",
    price: 1050,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800",
  },
  {
    id: 3,
    name: "Pepperoni Pizza",
    description: "Crispy crust topped with mozzarella, tomato sauce and pepperoni.",
    price: 1200,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800",
  },
];

const menuItems = [
  { id: 4, name: "Grilled Chicken Burger", description: "Grilled chicken breast with fresh vegetables and sauce.", price: 750, category: "Burgers", rating: 4.4, image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800" },
  { id: 5, name: "Margherita Pizza", description: "Fresh mozzarella, tomato sauce and basil.", price: 950, category: "Pizza", rating: 4.7, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800" },
  { id: 6, name: "Crispy Chicken Wings", description: "Crispy fried chicken wings with your choice of sauce.", price: 650, category: "Chicken", rating: 4.5, image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800" },
  { id: 7, name: "Chicken Alfredo", description: "Creamy Alfredo pasta with grilled chicken and parmesan.", price: 1100, category: "Pasta", rating: 4.6, image: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800" },
  { id: 8, name: "Fresh Lemonade", description: "Freshly squeezed lemon with chilled water and mint.", price: 350, category: "Drinks", rating: 4.3, image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=800" },
  { id: 9, name: "Chocolate Cake", description: "Rich chocolate cake with smooth chocolate frosting.", price: 450, category: "Desserts", rating: 4.8, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-surface text-ink">

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-hairline bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-brand">DineDesk</h1>
            <p className="text-xs text-ink-soft">Order directly from your table</p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-hairline bg-surface py-1.5 pl-3 pr-1.5 shadow-soft">
            <span className="text-xs text-ink-soft">Table</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
              12
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-32 sm:px-6 lg:px-8">

        {/* Hero */}
        <section className="py-6">
          <div className="relative overflow-hidden rounded-card bg-surface-dark p-7 shadow-soft sm:p-9">
            <div className="relative z-10">
              <p className="text-sm font-semibold text-brand-soft/80">Welcome to</p>
              <h2 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                The Urban Kitchen
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
                Explore our menu and order your favorite dishes directly from your table.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-success-bg px-3 py-1.5 text-xs font-bold text-success-text">
                  ● Open · until 11 PM
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
                  📍 Islamabad
                </span>
              </div>
            </div>

            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand/40 blur-3xl" />
            <div className="absolute -bottom-20 right-24 h-48 w-48 rounded-full bg-brand/25 blur-3xl" />
          </div>
        </section>

        {/* Search */}
        <section className="mt-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for food or drinks..."
              className="w-full rounded-full border border-hairline bg-surface py-3.5 pl-12 pr-4 text-sm text-ink shadow-soft outline-none transition placeholder:text-ink-muted focus:border-brand focus:ring-4 focus:ring-brand-soft"
            />
            <svg
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
            </svg>
          </div>
        </section>

        {/* Categories */}
        <section className="mt-6">
          <div className="flex gap-2.5 overflow-x-auto pb-2">
            {categories.map((category, index) => (
              <button
                key={category}
                className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition ${index === 0
                    ? "bg-brand text-white shadow-soft"
                    : "border border-hairline bg-surface text-ink-soft shadow-soft hover:text-ink"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Popular Items */}
        <section className="mt-10">
          <div className="mb-5 flex items-baseline justify-between">
            <div>
              <p className="text-sm font-semibold text-brand">Customer favorites</p>
              <h3 className="mt-0.5 text-2xl font-bold tracking-tight">Popular Items</h3>
            </div>
            <button className="text-sm font-semibold text-brand hover:text-brand-deep">See all →</button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {popularItems.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-card border border-hairline bg-surface p-3 shadow-soft transition hover:shadow-lift"
              >
                <div className="relative">
                  <img src={item.image} alt={item.name} className="h-52 w-full rounded-2xl object-cover" />

                  <span className="absolute left-5 top-5 rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    Popular
                  </span>

                  <span className="absolute bottom-5 right-5 rounded-full bg-white/95 px-3 py-1.5 text-sm font-bold text-price backdrop-blur">
                    Rs. {item.price}
                  </span>
                </div>

                <div className="px-2 pb-2 pt-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-star">
                    ★ {item.rating}
                  </div>
                  <h4 className="mt-1 font-bold text-ink">{item.name}</h4>
                  <p className="mt-1 text-sm leading-5 text-ink-soft">{item.description}</p>

                  <button className="mt-4 w-full rounded-full bg-brand py-3 text-sm font-bold text-white transition hover:bg-brand-deep">
                    Add to Order
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Full Menu — grid cards */}
        <section className="mt-12">
          <div className="mb-5">
            <p className="text-sm font-semibold text-brand">Explore our selection</p>
            <h3 className="mt-0.5 text-2xl font-bold tracking-tight">Full Menu</h3>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {menuItems.map((item) => (
              <article
                key={item.id}
                className="group flex flex-col overflow-hidden rounded-card border border-hairline bg-surface p-3 shadow-soft transition hover:shadow-lift"
              >
                <div className="relative">
                  <img src={item.image} alt={item.name} className="h-44 w-full rounded-2xl object-cover" />

                  <span className="absolute left-4 top-4 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ink backdrop-blur">
                    {item.category}
                  </span>
                </div>

                <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-bold text-ink">{item.name}</h4>
                    <span className="whitespace-nowrap text-sm font-bold text-price">
                      Rs. {item.price}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-star">
                    ★ {item.rating}
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm leading-5 text-ink-soft">
                    {item.description}
                  </p>

                  <button className="mt-4 w-full rounded-full bg-brand py-2.5 text-sm font-bold text-white transition hover:bg-brand-deep">
                    + Add to Order
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Footer card */}
        <section className="mt-12 rounded-card bg-surface-dark p-7 text-center shadow-soft">
          <h3 className="text-lg font-bold text-white">The Urban Kitchen</h3>
          <p className="mt-1.5 text-sm text-white/60">
            Fresh food prepared with quality ingredients.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-white/70">
            <span>Open 11:00 AM – 11:00 PM</span>
            <span>Islamabad, Pakistan</span>
            <span>+92 300 1234567</span>
          </div>
        </section>
      </div>

      {/* Cart Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-hairline bg-surface/85 p-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs text-ink-soft">Your Order</p>
            <p className="font-bold text-ink">2 items · Rs. 1,600</p>
          </div>

          <button className="flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-brand-deep">
            View Order
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-brand">
              2
            </span>
          </button>
        </div>
      </div>
    </main>
  );
}