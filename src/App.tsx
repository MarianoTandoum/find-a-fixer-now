
import React from "react";
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import About from "@/pages/About";
import Search from "@/pages/Search";
import TechnicianProfile from "@/pages/TechnicianProfile";
import Register from "@/pages/Register";
import { Toaster } from "@/components/ui/toaster";
import Contact from "@/pages/Contact";
import Admin from "@/pages/Admin";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";

// Determine if we're on GitHub Pages or not
const isGitHubPages = window.location.hostname.includes('github.io');
const basename = isGitHubPages ? '/find-a-fixer-now' : '/';

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Index />,
      errorElement: <NotFound />,
    },
    {
      path: "/about",
      element: <About />,
    },
    {
      path: "/search",
      element: <Search />,
    },
    {
      path: "/technician/:id",
      element: <TechnicianProfile />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/contact",
      element: <Contact />,
    },
    {
      path: "/admin",
      element: <Admin />,
    },
    {
      path: "/auth",
      element: <Auth />,
    },
    {
      path: "/profile",
      element: <Profile />,
    },
  ],
  { basename }
);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default App;
