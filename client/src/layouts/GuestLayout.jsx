import { Outlet, useNavigate } from "react-router";
import { useEffect } from "react";

export default function GuestLayout() {
  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [token, navigate]);

  return (
    <>
      <Outlet />
    </>
  );
}
