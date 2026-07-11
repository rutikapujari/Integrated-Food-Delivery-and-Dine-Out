import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaUtensils,
  FaClipboardList,
  FaChartLine,
  FaStore,
  FaUsers,
  FaCog,
  FaBell,
  FaSearch,
  FaUserCircle,
  FaChevronRight,
} from "react-icons/fa";

const menuItems = [
  { label: "Dashboard", to: "/", icon: <FaHome /> },
  {
    label: "Menu",
    to: "/menu",
    icon: <FaUtensils />,
    children: ["Starters", "Breakfast", "Lunch", "Dinner", "Sweets", "Drinks"],
  },
  { label: "Orders", to: "/orders", icon: <FaClipboardList /> },
  { label: "Analytics", to: "/analytics", icon: <FaChartLine /> },
  { label: "Restaurants", to: "/restaurants", icon: <FaStore /> },
  { label: "Customers", to: "/customers", icon: <FaUsers /> },
  { label: "Settings", to: "/settings", icon: <FaCog /> },
];

const AdminLayout = ({ page, title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1500px] gap-6 xl:grid-cols-[280px_1fr]">
        <aside className="sticky top-8 rounded-[32px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/30">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-orange-600">Restoboard</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Dashboard</h2>
            </div>
            <button className="grid h-11 w-11 place-items-center rounded-3xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
              <FaBell />
            </button>
          </div>

          <div className="mt-10 space-y-2">
            {menuItems.map((item) => (
              <div key={item.label}>
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `flex w-full items-center justify-between gap-3 rounded-3xl px-4 py-3 text-left text-sm font-medium transition ${
                      isActive ? "bg-orange-500 text-white shadow-[0_10px_30px_rgba(251,146,60,0.15)]" : "text-slate-700 hover:bg-slate-100"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="inline-flex items-center gap-3">
                        <span className={`grid h-11 w-11 place-items-center rounded-3xl ${
                          isActive ? "bg-white text-orange-500" : "bg-slate-100 text-slate-900"
                        }`}>
                          {item.icon}
                        </span>
                        {item.label}
                      </span>
                      {isActive ? <FaChevronRight /> : null}
                    </>
                  )}
                </NavLink>

                {item.children && (
                  <div className="mt-2 space-y-1 pl-16 text-sm text-slate-500">
                    {item.children.map((sub) => (
                      <button key={sub} className="block w-full rounded-2xl px-3 py-2 text-left transition hover:bg-slate-100 hover:text-slate-900">
                        {sub}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[32px] bg-slate-950 p-5 text-white shadow-xl shadow-slate-950/20">
            <p className="text-xs uppercase tracking-[0.30em] text-slate-400">Weekly focus</p>
            <h3 className="mt-4 text-xl font-semibold">Boost delivery speed</h3>
            <p className="mt-3 text-sm text-slate-300">Optimize routes and prep times to keep deliveries fast and customers happy.</p>
            <button className="mt-5 inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-400">
              Start campaign <FaChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </aside>

        <main>
          <div className="rounded-[32px] bg-white p-6 shadow-lg shadow-slate-200/30">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">{title}</p>
                <h1 className="mt-3 text-3xl font-semibold text-slate-900">{title}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{subtitle}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-100 px-4 py-3">
                  <FaSearch className="text-slate-400" />
                  <input className="w-52 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" placeholder="Search..." />
                </div>
                <div className="inline-flex items-center gap-3 rounded-full bg-slate-50 px-4 py-3 shadow-sm shadow-slate-200/80">
                  <FaUserCircle className="h-11 w-11 rounded-full bg-orange-100 p-2 text-orange-600" />
                  <div>
                    <p className="font-semibold text-slate-900">Albert Jone</p>
                    <p className="text-xs text-slate-500">Manager</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm shadow-slate-200/40">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Total Revenue</p>
                <h2 className="mt-4 text-3xl font-semibold text-slate-900">₹89,935</h2>
                <p className="mt-3 text-sm text-slate-500">+2.1% this week</p>
              </div>
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm shadow-slate-200/40">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Total Customers</p>
                <h2 className="mt-4 text-3xl font-semibold text-slate-900">23,283</h2>
                <p className="mt-3 text-sm text-slate-500">+1.8% this week</p>
              </div>
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm shadow-slate-200/40">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Total Orders</p>
                <h2 className="mt-4 text-3xl font-semibold text-slate-900">46,827</h2>
                <p className="mt-3 text-sm text-slate-500">+3.6% this week</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
