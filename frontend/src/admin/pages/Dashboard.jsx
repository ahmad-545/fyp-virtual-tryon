import React from "react";
import {
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

const cards = [
  {
    title: "Total Products",
    value: "120",
    icon: Package,
    color: "bg-blue-500",
  },
  {
    title: "Total Orders",
    value: "340",
    icon: ShoppingCart,
    color: "bg-green-500",
  },
  {
    title: "Revenue",
    value: "PKR 245,000",
    icon: DollarSign,
    color: "bg-yellow-500",
  },
  {
    title: "Customers",
    value: "89",
    icon: Users,
    color: "bg-purple-500",
  },
];

const orders = [
  {
    id: "#1001",
    customer: "Ahmed",
    amount: "PKR 3500",
    status: "Delivered",
  },
  {
    id: "#1002",
    customer: "Ali",
    amount: "PKR 5200",
    status: "Pending",
  },
  {
    id: "#1003",
    customer: "Usman",
    amount: "PKR 1800",
    status: "Processing",
  },
  {
    id: "#1004",
    customer: "Hamza",
    amount: "PKR 4100",
    status: "Delivered",
  },
];

const Dashboard = () => {
  return (
    <div className="space-y-8">

      {/* Heading */}

      <div>

        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard
        </h1>

        <p className="text-gray-500 mt-1">
          Welcome back! Here's your store overview.
        </p>

      </div>

      {/* Cards */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

        {cards.map((card, index) => {

          const Icon = card.icon;

          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-lg transition"
            >

              <div className="flex justify-between items-center">

                <div>

                  <p className="text-gray-500 text-sm">
                    {card.title}
                  </p>

                  <h2 className="text-3xl font-bold mt-2">
                    {card.value}
                  </h2>

                </div>

                <div
                  className={`${card.color} p-4 rounded-xl text-white`}
                >
                  <Icon size={24} />
                </div>

              </div>

            </div>
          );
        })}
      </div>

      {/* Middle */}

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Sales */}

        <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm p-6">

          <div className="flex justify-between items-center mb-6">

            <h2 className="text-xl font-bold">
              Sales Overview
            </h2>

            <div className="flex items-center gap-2 text-green-600 font-semibold">

              <TrendingUp size={18} />

              +18%

            </div>

          </div>

          <div className="h-72 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">

            <div className="text-center">

              <TrendingUp
                className="mx-auto text-gray-400"
                size={60}
              />

              <p className="mt-4 text-gray-500">
                Sales Chart will appear here
              </p>

            </div>

          </div>

        </div>

        {/* Quick Stats */}

        <div className="bg-white rounded-2xl border shadow-sm p-6">

          <h2 className="text-xl font-bold mb-6">
            Quick Stats
          </h2>

          <div className="space-y-5">

            <div>

              <div className="flex justify-between">

                <span>Total Products</span>

                <span className="font-semibold">
                  120
                </span>

              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">

                <div className="bg-blue-500 h-2 rounded-full w-[70%]" />

              </div>

            </div>

            <div>

              <div className="flex justify-between">

                <span>Orders Completed</span>

                <span className="font-semibold">
                  240
                </span>

              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">

                <div className="bg-green-500 h-2 rounded-full w-[80%]" />

              </div>

            </div>

            <div>

              <div className="flex justify-between">

                <span>Pending Orders</span>

                <span className="font-semibold">
                  35
                </span>

              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">

                <div className="bg-yellow-500 h-2 rounded-full w-[30%]" />

              </div>

            </div>

            <div>

              <div className="flex justify-between">

                <span>Revenue Goal</span>

                <span className="font-semibold">
                  65%
                </span>

              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">

                <div className="bg-purple-500 h-2 rounded-full w-[65%]" />

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Recent Orders */}

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">

        <div className="flex justify-between items-center p-6 border-b">

          <h2 className="text-xl font-bold">
            Recent Orders
          </h2>

          <button className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700">

            View All

            <ArrowUpRight size={18} />

          </button>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-50">

              <tr>

                <th className="text-left p-4">
                  Order ID
                </th>

                <th className="text-left p-4">
                  Customer
                </th>

                <th className="text-left p-4">
                  Amount
                </th>

                <th className="text-left p-4">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {orders.map((order) => (

                <tr
                  key={order.id}
                  className="border-t hover:bg-gray-50"
                >

                  <td className="p-4 font-semibold">
                    {order.id}
                  </td>

                  <td className="p-4">
                    {order.customer}
                  </td>

                  <td className="p-4">
                    {order.amount}
                  </td>

                  <td className="p-4">

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : order.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {order.status}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;