import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import api from "../lib/http";

export default function GoogleLoginButton({
  onSuccess,
  onError,
  disabled = false,
}) {
  const googleButtonRef = useRef(null);
  const navigate = useNavigate();

  const handleCredentialResponse = useCallback(
    async (response) => {
      if (!response.credential) {
        const errorMsg = "No credential received from Google";
        console.error(errorMsg);
        toast.error(errorMsg);
        if (onError) onError(errorMsg);
        return;
      }

      try {
        // Send the credential to your backend
        const loginResponse = await api.post("/google-login", {
          googleToken: response.credential,
        });

        // Store the access token and user data
        localStorage.setItem("access_token", loginResponse.data.access_token);
        localStorage.setItem("user", JSON.stringify(loginResponse.data.user));

        toast.success("Google login successful!");

        if (onSuccess) {
          onSuccess(loginResponse.data);
        } else {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Google login error:", error);
        const errorMessage =
          error?.response?.data?.message || "Google login failed";
        toast.error(errorMessage);
        if (onError) onError(errorMessage);
      }
    },
    [navigate, onSuccess, onError]
  );

  useEffect(() => {
    const initializeGoogle = () => {
      if (window.google && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id:
            "511656772397-90qaanfjia0dabpp6899mvf3ue2gq6ft.apps.googleusercontent.com",
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          type: "standard",
          text: "signin_with",
          shape: "rounded",
          logo_alignment: "left",
        });
      } else {
        // Retry after a short delay if Google hasn't loaded yet
        setTimeout(initializeGoogle, 100);
      }
    };

    initializeGoogle();
  }, [handleCredentialResponse]);

  return (
    <div className="w-full flex justify-center">
      <div
        ref={googleButtonRef}
        className={`${disabled ? "opacity-50 pointer-events-none" : ""}`}
      />
    </div>
  );
}
